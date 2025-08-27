import { useCallback, useRef } from 'react';

type SoundType = 'correct' | 'incorrect';

export const useSoundEffects = () => {
  const audioContext = useRef<AudioContext | null>(null);

  const playSound = useCallback((type: SoundType, muted: boolean) => {
    if (muted) return;

    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContext.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'correct') {
      // A short, triumphant "roar" sound
      const fundamental = 110; // Low frequency base
      const roarTime = 0.4;
      for (let i = 0; i < 5; i++) { // Stack oscillators for a thicker sound
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(ctx.destination);
        
        const startTime = ctx.currentTime;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(fundamental * (1 + Math.random() * 0.2), startTime); // Detune for richness
        
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(0.08, startTime + 0.05); // Quick attack
        g.gain.exponentialRampToValueAtTime(0.0001, startTime + roarTime);
        
        osc.start(startTime);
        osc.stop(startTime + roarTime);
      }
    } else if (type === 'incorrect') {
      // A lower, grumbling "roar"
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const startTime = ctx.currentTime;
      const roarTime = 0.5;

      gainNode.gain.setValueAtTime(0.15, startTime);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, startTime); // Start low
      osc.frequency.exponentialRampToValueAtTime(60, startTime + roarTime * 0.8); // Go lower
      
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + roarTime);
      osc.start(startTime);
      osc.stop(startTime + roarTime);
    }
  }, []);

  return { playSound };
};