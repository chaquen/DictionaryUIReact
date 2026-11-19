import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useVoiceRecorder } from './useVoiceRecorder';

class FakeRecorder {
  constructor() {
    this.state = 'inactive';
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.ondataavailable({ data: new Blob(['voice'], { type: 'audio/webm' }) });
    this.onstop();
  }
}

describe('useVoiceRecorder', () => {
  it('records an attempt and gives a local URL to play it', async () => {
    const track = { stop: vi.fn() };
    const mediaDevices = { getUserMedia: vi.fn(async () => ({ getTracks: () => [track] })) };
    URL.createObjectURL = vi.fn(() => 'blob:voice');
    URL.revokeObjectURL = vi.fn();
    const { result } = renderHook(() => useVoiceRecorder({ mediaDevices, Recorder: FakeRecorder }));

    await act(async () => {
      const stop = await result.current.start();
      await stop();
    });

    expect(result.current.url).toBe('blob:voice');
    expect(track.stop).toHaveBeenCalled();
  });

  it('records nothing when the microphone is refused', async () => {
    const mediaDevices = { getUserMedia: vi.fn().mockRejectedValue(new Error('NotAllowedError')) };
    const { result } = renderHook(() => useVoiceRecorder({ mediaDevices, Recorder: FakeRecorder }));

    await act(async () => {
      const stop = await result.current.start();
      await stop();
    });

    expect(result.current.url).toBeNull();
  });
});
