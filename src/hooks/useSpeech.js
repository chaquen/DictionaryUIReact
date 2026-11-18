import { useCallback, useEffect } from 'react';

const LANG = 'en-US';
const RATE = 0.95;

/** macOS ships joke voices (names may be localized) that must never be picked. */
const NOVELTY_VOICES =
  /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|buenas noticias|malas noticias|jester|organ|superstar|trinoids|whisper|wobble|zarvox|hysterical|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley)\b/i;

/** Old formant voices: usable, but the most robotic ones. */
const LEGACY_VOICES = /\b(fred|junior|kathy|ralph|princess|vicki|victoria|agnes|bruce)\b/i;

/**
 * Ranks the voices installed in the browser/OS. Neural and network voices
 * (Edge "Natural", Chrome "Google", macOS "Premium"/"Enhanced") sound far
 * less robotic than the default ones.
 */
export function scoreVoice(voice) {
  if (!voice?.lang?.toLowerCase().startsWith('en')) return -Infinity;
  if (NOVELTY_VOICES.test(voice.name)) return -Infinity;
  let score = 0;
  if (LEGACY_VOICES.test(voice.name)) score -= 20;
  if (/natural|neural/i.test(voice.name)) score += 50;
  if (/premium/i.test(voice.name)) score += 40;
  if (/enhanced/i.test(voice.name)) score += 30;
  if (/^google/i.test(voice.name)) score += 25;
  if (/\b(samantha|ava|allison|evan|nathan|zoe|aria|jenny|guy)\b/i.test(voice.name)) score += 10;
  if (voice.lang.replace('_', '-').toLowerCase() === LANG.toLowerCase()) score += 5;
  return score;
}

export function pickBestVoice(voices) {
  let best = null;
  for (const voice of voices ?? []) {
    if (scoreVoice(voice) > (best ? scoreVoice(best) : -Infinity)) best = voice;
  }
  return best;
}

const failedAudio = new Set();

function playRecording(url) {
  if (!url || failedAudio.has(url) || typeof globalThis.Audio !== 'function') {
    return Promise.reject(new Error('No playable recording'));
  }
  return new globalThis.Audio(url).play().catch((error) => {
    // Remember broken URLs so later clicks go straight to the fallback.
    if (error?.name !== 'NotAllowedError') failedAudio.add(url);
    throw error;
  });
}

function speakWithSynthesis(text) {
  const synth = globalThis.speechSynthesis;
  if (!synth || typeof globalThis.SpeechSynthesisUtterance !== 'function') return false;
  synth.cancel();
  const utterance = new globalThis.SpeechSynthesisUtterance(text);
  utterance.lang = LANG;
  utterance.rate = RATE;
  const voice = pickBestVoice(synth.getVoices());
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
  return true;
}

/**
 * Pronounces text. Plays the human recording when there is one and falls
 * back to the best speech-synthesis voice available otherwise.
 */
export function useSpeech() {
  // Some browsers load the voice list asynchronously; ask early so it is
  // ready by the first click.
  useEffect(() => {
    globalThis.speechSynthesis?.getVoices();
  }, []);

  return useCallback(async ({ text, audioUrl = null }) => {
    if (audioUrl) {
      try {
        await playRecording(audioUrl);
        return 'recording';
      } catch {
        // Fall through to synthesis.
      }
    }
    return speakWithSynthesis(text) ? 'synthesis' : 'unsupported';
  }, []);
}
