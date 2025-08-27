import { useRef, useCallback } from 'react';
import { backgroundMusic } from '../assets/music';

export const useBackgroundMusic = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const playMusic = useCallback(() => {
        // If audio element doesn't exist or is not the correct one, create it
        if (!audioRef.current) {
            audioRef.current = new Audio(backgroundMusic);
            audioRef.current.loop = true; // Loop the music
            audioRef.current.volume = 0.2; // Set a reasonable volume
        }
        
        const audio = audioRef.current;
        
        // The play() method returns a Promise, which is useful for handling autoplay restrictions.
        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Autoplay was prevented.
                console.warn("Background music autoplay was prevented by the browser.", error);
                // We could show a "Click to play music" button here if needed.
            });
        }
    }, []);
    
    const stopMusic = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Rewind to the start
        }
    }, []);

    const setMusicMuted = useCallback((muted: boolean) => {
        if (audioRef.current) {
            audioRef.current.muted = muted;
        }
    }, []);

    return { playMusic, stopMusic, setMusicMuted };
};