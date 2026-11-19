import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Records the user's attempt (#2) so it can be compared with the native
 * recording. The audio stays in memory on this page: it is never saved or
 * sent. Without a microphone API it simply records nothing.
 *
 * @param {{ mediaDevices?: MediaDevices, Recorder?: typeof MediaRecorder }} [deps]  Injectable for tests.
 */
export function useVoiceRecorder({
  mediaDevices = globalThis.navigator?.mediaDevices,
  Recorder = globalThis.MediaRecorder,
} = {}) {
  const [url, setUrl] = useState(null);
  const current = useRef(null);

  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);

  /** Starts recording; resolves with a `stop()` that resolves when the clip is ready. */
  const start = useCallback(async () => {
    if (!mediaDevices?.getUserMedia || typeof Recorder !== 'function') return () => Promise.resolve();
    try {
      const stream = await mediaDevices.getUserMedia({ audio: true });
      const recorder = new Recorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => e.data?.size && chunks.push(e.data);
      const finished = new Promise((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          if (chunks.length) setUrl(URL.createObjectURL(new Blob(chunks, { type: chunks[0].type || 'audio/webm' })));
          resolve();
        };
      });
      recorder.start();
      current.current = recorder;
      return () => {
        if (recorder.state !== 'inactive') recorder.stop();
        return finished;
      };
    } catch {
      return () => Promise.resolve(); // Microphone refused: practise without the recording.
    }
  }, [mediaDevices, Recorder]);

  return { start, url };
}
