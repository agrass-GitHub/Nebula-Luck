import React, { useEffect, useRef } from 'react';
import { AppState } from '../types';

interface AudioManagerProps {
  appState: AppState;
  enabled: boolean;
}

const AudioManager: React.FC<AudioManagerProps> = ({ appState, enabled }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Oscillators refs for continuous sounds
  const drawNodesRef = useRef<{ osc: OscillatorNode, gain: GainNode, filter: BiquadFilterNode } | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('mousedown', handleInteraction);
    };
    
    window.addEventListener('mousedown', handleInteraction);
    return () => window.removeEventListener('mousedown', handleInteraction);
  }, []);

  // Handle Global Click Sound
  useEffect(() => {
      if (!enabled) return;

      const playClick = () => {
          if (!audioCtxRef.current) return;
          const ctx = audioCtxRef.current;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
          
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
      };

      window.addEventListener('mousedown', playClick);
      return () => window.removeEventListener('mousedown', playClick);
  }, [enabled]);

  // Helper: Drawing Sound (The Engine - Retained)
  const startDrawingSound = () => {
      if (!audioCtxRef.current || !enabled) return;
      stopDrawingSound();

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Lower pitch engine sound for warp effect
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 3);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(3000, ctx.currentTime + 3);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);

      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start();

      drawNodesRef.current = { osc, gain, filter };
  };

  const stopDrawingSound = () => {
      if (drawNodesRef.current) {
          try {
            const { gain, osc } = drawNodesRef.current;
            gain.gain.setTargetAtTime(0, audioCtxRef.current!.currentTime, 0.1);
            osc.stop(audioCtxRef.current!.currentTime + 0.2);
          } catch(e) {}
          drawNodesRef.current = null;
      }
  };

  const playWinSound = () => {
      if (!audioCtxRef.current || !enabled) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const note = (freq: number, offset: number, dur: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0, now + offset);
          gain.gain.linearRampToValueAtTime(0.15, now + offset + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + dur);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + dur);
      };

      // Sci-fi victory chord
      note(523.25, 0, 0.4); // C5
      note(659.25, 0.1, 0.4); // E5
      note(783.99, 0.2, 0.4); // G5
      note(1046.50, 0.4, 1.0); // C6
  };

  // State Reactions
  useEffect(() => {
      if (!enabled) {
          stopDrawingSound();
          return;
      }
      // REMOVED startBGM() call to ensure no background noise by default.

      if (appState === AppState.DRAWING) {
          startDrawingSound();
      } else {
          stopDrawingSound();
      }

      if (appState === AppState.SHOW_WINNER) {
          playWinSound();
      }

  }, [appState, enabled]);

  return null;
};

export default AudioManager;
