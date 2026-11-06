"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function beep(
  context: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
  volume = 0.08,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);

  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
}

export function useKitchenSound() {
  const [enabled, setEnabled] = useState(false);
  const contextRef = useRef<AudioContext | null>(null);

  const playAlert = useCallback(() => {
    const context = contextRef.current;
    if (!context || context.state !== "running") return;

    const now = context.currentTime + 0.04;
    beep(context, 880, now, 0.16, 0.09);
    beep(context, 1174.66, now + 0.19, 0.16, 0.08);
    beep(context, 1567.98, now + 0.38, 0.3, 0.09);
  }, []);

  const enable = useCallback(async () => {
    try {
      if (!contextRef.current) {
        const AudioContextClass =
          window.AudioContext ??
          (window as AudioContextWindow).webkitAudioContext;
        if (!AudioContextClass) return false;
        contextRef.current = new AudioContextClass();
      }

      await contextRef.current.resume();
      setEnabled(true);

      const context = contextRef.current;
      const now = context.currentTime + 0.03;
      beep(context, 880, now, 0.14, 0.07);
      beep(context, 1318.51, now + 0.16, 0.2, 0.07);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
      contextRef.current = null;
    };
  }, []);

  return { enabled, enable, playAlert };
}
