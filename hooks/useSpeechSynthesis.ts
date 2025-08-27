import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [preferredVoice, setPreferredVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      const handleVoicesChanged = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      // Initial fetch in case the event was already fired
      handleVoicesChanged();
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  useEffect(() => {
    if (voices.length > 0 && !preferredVoice) {
      // --- Find a more natural, friendly voice ---
      // We'll prioritize Google voices, then specific high-quality voices by name, then any US English voice.
      const voicePreferences = [
        (v: SpeechSynthesisVoice) => v.name.includes('Google') && v.lang.startsWith('en'),
        (v: SpeechSynthesisVoice) => v.name === 'Samantha' && v.lang.startsWith('en'), // High quality iOS/macOS
        (v: SpeechSynthesisVoice) => v.name === 'Alex' && v.lang.startsWith('en'), // High quality macOS
        (v: SpeechSynthesisVoice) => v.name === 'Microsoft Zira Desktop - English (United States)' && v.lang.startsWith('en'), // High quality Windows
        (v: SpeechSynthesisVoice) => v.lang === 'en-US',
        (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
      ];

      for (const condition of voicePreferences) {
        const foundVoice = voices.find(condition);
        if (foundVoice) {
          setPreferredVoice(foundVoice);
          break;
        }
      }
    }
  }, [voices, preferredVoice]);

  const speak = useCallback((text: string, options: { rate?: number; pitch?: number; muted?: boolean } = {}) => {
    // More enthusiastic defaults
    const { rate = 1, pitch = 1.2, muted = false } = options;
    if (!isSupported || !text || muted) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }, [isSupported, preferredVoice]);

  return { speak, isSupported };
};
