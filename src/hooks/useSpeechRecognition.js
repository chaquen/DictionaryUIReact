import { useCallback, useEffect, useState } from 'react';

export const speechRecognitionApi = () => globalThis.SpeechRecognition ?? globalThis.webkitSpeechRecognition ?? null;

/** Where a failed on-device install is remembered, so the user is not asked again on every word. */
export const LOCAL_FAILED_KEY = 'dictionary-ui:speech-local-failed:v1';
const RETRY_LOCAL_AFTER_MS = 24 * 60 * 60 * 1000;

const storage = () => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

/** True when installing the on-device pack failed less than a day ago. */
export function localInstallFailedRecently(now = Date.now()) {
  try {
    const at = Number(storage()?.getItem(LOCAL_FAILED_KEY));
    return Number.isFinite(at) && at > 0 && now - at < RETRY_LOCAL_AFTER_MS;
  } catch {
    return false;
  }
}

function rememberLocalInstallFailed() {
  try {
    storage()?.setItem(LOCAL_FAILED_KEY, String(Date.now()));
  } catch {
    // Without storage the user is simply asked again next time.
  }
}

const withTimeout = (promise, ms, fallback) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), ms))]);

/**
 * How speech can be recognized on this device (#2):
 * - 'local': on the device (`processLocally`), nothing leaves the browser.
 * - 'downloadable': on the device after downloading a language pack (needs a click).
 * - 'cloud': only through the browser's service (Chrome sends the audio to Google).
 * - 'unavailable': no speech recognition.
 */
export async function speechRecognitionMode(api, lang) {
  if (!api) return 'unavailable';
  if (typeof api.available !== 'function') return 'cloud';
  try {
    const status = await withTimeout(api.available({ langs: [lang], processLocally: true }), 5000, 'unavailable');
    if (status === 'available') return 'local';
    // Chrome may keep reporting "downloadable" while install() fails: after a failure, go to the service.
    if (status === 'downloadable' || status === 'downloading') return localInstallFailedRecently() ? 'cloud' : 'downloadable';
    return 'cloud';
  } catch {
    return 'cloud';
  }
}

/**
 * Speech recognition for single words (#2, FR-002). On-device whenever the
 * browser supports it. No contextual biasing on purpose: biasing towards the
 * expected word would make it "heard" even when it is mispronounced.
 *
 * `listen()` must be called from a click (it may download the language pack
 * and starts the microphone). It resolves with the alternatives heard or an
 * error code ('not-allowed', 'no-speech', 'network', 'install-failed', 'timeout'…).
 *
 * @param {{ lang?: string, api?: any, timeoutMs?: number }} [options]  `api` is injectable for tests.
 */
export function useSpeechRecognition({ lang = 'en-US', api = speechRecognitionApi(), timeoutMs = 10000 } = {}) {
  const [mode, setMode] = useState(api ? 'checking' : 'unavailable');

  useEffect(() => {
    let active = true;
    speechRecognitionMode(api, lang).then((m) => active && setMode(m));
    return () => {
      active = false;
    };
  }, [api, lang]);

  const listen = useCallback(
    async ({ onInstalling } = {}) => {
      let local = mode === 'local';
      if (mode === 'downloadable') {
        onInstalling?.();
        const installed = await api.install({ langs: [lang] }).catch(() => false);
        if (!installed) {
          rememberLocalInstallFailed();
          // Seen in Chrome 157: available() says "downloadable" but install() fails. Fall back to the
          // browser's service, which sends audio to Google: the user is told and must click again.
          setMode('cloud');
          return { status: 'error', code: 'install-failed', local: false };
        }
        local = true;
        setMode('local');
      }
      return new Promise((resolve) => {
        const recognition = new api();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3; // Only the best counts; the others are kept in the events for analysis.
        if (local) recognition.processLocally = true;

        let done = false;
        const finish = (value) => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve({ ...value, local });
        };
        const timer = setTimeout(() => {
          recognition.abort?.();
          finish({ status: 'error', code: 'timeout' });
        }, timeoutMs);

        recognition.onresult = (event) => {
          const result = event.results[0];
          finish({ status: 'ok', alternatives: Array.from(result, (alternative) => alternative.transcript) });
        };
        recognition.onerror = (event) => finish({ status: 'error', code: event.error ?? 'unknown' });
        recognition.onend = () => finish({ status: 'error', code: 'no-speech' });
        try {
          recognition.start();
        } catch {
          finish({ status: 'error', code: 'unknown' });
        }
      });
    },
    [api, lang, mode],
  );

  return { mode, listen };
}
