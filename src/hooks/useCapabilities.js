import { useEffect, useState } from 'react';
import { speechRecognitionApi, speechRecognitionMode } from './useSpeechRecognition';

const withTimeout = (promise, ms, fallback) =>
  Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(fallback), ms))]);

/**
 * What this device can do (FR-011): speech recognition, microphone permission
 * and on-device AI. Ideas that need a missing capability hide or explain why.
 *
 * @param {{ speechApi?: any, permissions?: Permissions, languageModel?: any }} [deps]  Injectable for tests.
 * @returns {{ speech: string, microphone: string, localAi: string }}  'checking' until known.
 */
export function useCapabilities({
  speechApi = speechRecognitionApi(),
  permissions = globalThis.navigator?.permissions,
  languageModel = globalThis.LanguageModel,
} = {}) {
  const [capabilities, setCapabilities] = useState({ speech: 'checking', microphone: 'checking', localAi: 'checking' });

  useEffect(() => {
    let active = true;
    const microphone = permissions?.query
      ? permissions
          .query({ name: 'microphone' })
          .then((p) => p.state)
          .catch(() => 'unknown')
      : Promise.resolve('unknown');
    const localAi = languageModel?.availability
      ? withTimeout(
          languageModel.availability({
            expectedInputs: [{ type: 'text', languages: ['en'] }],
            expectedOutputs: [{ type: 'text', languages: ['en'] }],
          }),
          5000,
          'unavailable',
        ).catch(() => 'unavailable')
      : Promise.resolve('unavailable');
    Promise.all([speechRecognitionMode(speechApi, 'en-US'), microphone, localAi]).then(([speech, mic, ai]) => {
      if (active) setCapabilities({ speech, microphone: mic, localAi: ai });
    });
    return () => {
      active = false;
    };
  }, [speechApi, permissions, languageModel]);

  return capabilities;
}
