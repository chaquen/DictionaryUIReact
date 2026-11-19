import { vi } from 'vitest';

/**
 * Fake `SpeechRecognition` constructor for tests: `start()` answers with the
 * given alternatives (or error) on the next tick.
 */
export function createFakeSpeechRecognition({ availability = 'available', heard = [], error = null, installOk = true } = {}) {
  const instances = [];
  class FakeSpeechRecognition {
    constructor() {
      instances.push(this);
    }

    start() {
      setTimeout(() => {
        if (error) this.onerror?.({ error });
        else this.onresult?.({ results: [heard.map((transcript) => ({ transcript }))] });
        this.onend?.();
      }, 0);
    }

    abort() {}
  }
  FakeSpeechRecognition.available = vi.fn(async () => availability);
  FakeSpeechRecognition.install = vi.fn(async () => installOk);
  FakeSpeechRecognition.instances = instances;
  return FakeSpeechRecognition;
}
