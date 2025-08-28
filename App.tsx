
import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import { Cloud } from './components/Cloud';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { useSoundEffects } from './hooks/useSoundEffects';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { getLevelConfig, getRandomNumber, getRandomSpeed, TOTAL_TRIALS, NUM_CLOUDS } from './gameLogic';
import type { CloudType, ParticleType } from './types';
import { dragonCursor } from './assets/cursors';

// --- SVG Icons (with accessibility improvements) ---
const PlayIcon: FC = () => (
  <svg className="w-8 h-8 mr-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);
const SpeakerIcon: FC = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
);
const MutedIcon: FC = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
);
const StarIcon: FC = () => (
  <svg className="w-8 h-8 mr-2 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
);
const Sun: FC = () => (
    <div className="absolute top-8 left-8 w-32 h-32 animate-pulse-slow z-0" role="img" aria-label="Smiling Sun">
        <style>{`
            @keyframes pulse-slow {
                50% { opacity: .9; transform: scale(1.05); }
            }
            .animate-pulse-slow {
                animation: pulse-slow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            .sun-face::before, .sun-face::after {
                content: '';
                position: absolute;
                background: #2c3e50;
                border-radius: 50%;
                width: 12px;
                height: 18px;
                top: 35%;
            }
            .sun-face::before { left: 25%; }
            .sun-face::after { left: 60%; }
            .sun-mouth {
                position: absolute;
                bottom: 25%;
                left: 50%;
                width: 50px;
                height: 25px;
                border: 5px solid #2c3e50;
                border-top-color: transparent;
                border-left-color: transparent;
                border-right-color: transparent;
                border-radius: 0 0 50px 50px / 0 0 50px 50px;
                transform: translateX(-50%);
            }
        `}</style>
        <div className="w-full h-full bg-yellow-300 rounded-full shadow-[0_0_40px_15px_rgba(253,249,150,0.8)] relative sun-face">
            <div className="sun-mouth"></div>
        </div>
    </div>
);
const PauseIcon: FC = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>
);
const ResumeIcon: FC = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
);
const StopIcon: FC = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6h12v12H6z"></path></svg>
);
const RestartIcon: FC = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>
);


// --- Game State Specific Components ---
const StartScreen: FC<{ 
    onStart: () => void; 
    speed: number; 
    onSpeedChange: (speed: number) => void; 
}> = ({ onStart, speed, onSpeedChange }) => (
    <div className="text-center bg-white/70 backdrop-blur-sm p-10 rounded-2xl shadow-2xl z-20 animate-fade-in w-full max-w-lg">
        <style>{`@keyframes fade-in { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } } .animate-fade-in { animation: fade-in 0.5s ease-out; }`}</style>
        <h1 className="text-6xl font-bold mb-2" style={{ fontFamily: "'Comic Sans MS', cursive" }}>Cloud Catcher</h1>
        <p className="text-2xl mb-6">Click the right number in 10 trials!</p>
        
        <div className="my-8">
            <label htmlFor="speed-slider" className="block text-xl font-medium mb-3">Adjust Cloud Speed</label>
            <input
                id="speed-slider"
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-full h-3 bg-blue-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-base font-semibold mt-2 px-1 text-slate-700">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
            </div>
        </div>

        <button
            onClick={onStart}
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-3xl shadow-lg transition-transform transform hover:scale-105 mt-8 mx-auto"
        >
            <PlayIcon /> Start Game
        </button>
    </div>
);

const EndScreen: FC<{ score: number; onPlayAgain: () => void }> = ({ score, onPlayAgain }) => (
    <div className="text-center bg-white/70 backdrop-blur-sm p-10 rounded-2xl shadow-2xl z-20 animate-fade-in">
        <h1 className="text-6xl font-bold mb-2 text-yellow-500" style={{ fontFamily: "'Comic Sans MS', cursive" }}>Great Job!</h1>
        <div className="flex justify-center my-4">
          <StarIcon /><StarIcon /><StarIcon />
        </div>
        <p className="text-3xl mb-8">You scored <span className="font-bold">{score}</span> out of <span className="font-bold">{TOTAL_TRIALS}</span>!</p>
        <button
            onClick={onPlayAgain}
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-3xl shadow-lg transition-transform transform hover:scale-105 mx-auto"
        >
            <PlayIcon /> Play Again
        </button>
    </div>
);

// --- Main App Component ---
export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'end'>('start');
  const [score, setScore] = useState(0);
  const [trial, setTrial] = useState(0);
  const [clouds, setClouds] = useState<CloudType[]>([]);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [feedbackCloudId, setFeedbackCloudId] = useState<number | null>(null);
  const [correctCloudId, setCorrectCloudId] = useState<number | null>(null);
  const [particles, setParticles] = useState<ParticleType[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const { speak } = useSpeechSynthesis();
  const { playSound } = useSoundEffects();
  const { playMusic, stopMusic, setMusicMuted } = useBackgroundMusic();
  const animationFrameId = useRef<number | null>(null);
  const lastTarget = useRef<number | null>(null);
  
  // --- Game Logic ---
  const generateClouds = useCallback((currentTrial: number) => {
    const { numberRange } = getLevelConfig(currentTrial);
    const yPositions: number[] = [];
    
    let newTarget;
    do {
      newTarget = getRandomNumber(numberRange[0], numberRange[1]);
    } while (newTarget === lastTarget.current);
    lastTarget.current = newTarget;

    const cloudNumbers = new Set<number>();
    cloudNumbers.add(newTarget);
    while (cloudNumbers.size < NUM_CLOUDS && cloudNumbers.size < (numberRange[1] - numberRange[0] + 1)) {
        let num;
        do {
            num = getRandomNumber(numberRange[0], numberRange[1]);
        } while(cloudNumbers.has(num));
        cloudNumbers.add(num);
    }
    const shuffledNumbers = Array.from(cloudNumbers).sort(() => Math.random() - 0.5);
    const { minSpeed, maxSpeed } = getLevelConfig(currentTrial);
    
    setTargetNumber(newTarget);
    setClouds(shuffledNumbers.map((num, i) => {
        let y: number | undefined;
        const MIN_Y = 15;
        const MAX_Y = 85;
        const CLOUD_VERTICAL_SEPARATION = 14;
        let attempts = 0;
        let positionFound = false;
        
        while (!positionFound && attempts < 50) {
            y = getRandomNumber(MIN_Y, MAX_Y);
            if (yPositions.every(p => Math.abs(p - y!) > CLOUD_VERTICAL_SEPARATION)) {
              positionFound = true;
            }
            attempts++;
        }

        if (!positionFound) {
            if (yPositions.length === 0) {
                y = getRandomNumber(MIN_Y, MAX_Y);
            } else {
                yPositions.sort((a, b) => a - b);
                let largestGap = 0;
                let gapStart = MIN_Y;
                let bestY = MIN_Y;

                if (yPositions[0] - MIN_Y > largestGap) {
                    largestGap = yPositions[0] - MIN_Y;
                    gapStart = MIN_Y;
                }

                for (let j = 0; j < yPositions.length - 1; j++) {
                    const gap = yPositions[j+1] - yPositions[j];
                    if (gap > largestGap) {
                        largestGap = gap;
                        gapStart = yPositions[j];
                    }
                }

                if (MAX_Y - yPositions[yPositions.length - 1] > largestGap) {
                    largestGap = MAX_Y - yPositions[yPositions.length - 1];
                    gapStart = yPositions[yPositions.length - 1];
                }
                
                y = gapStart + largestGap / 2;
            }
        }
        
        yPositions.push(y!);

        const direction = Math.random() < 0.5 ? 1 : -1; // 1 for L->R, -1 for R->L

      return {
          id: Date.now() + i,
          number: num,
          x: direction > 0 ? -30 - Math.random() * 40 : 130 + Math.random() * 40,
          y: y!,
          speed: direction * getRandomSpeed(minSpeed, maxSpeed, speedMultiplier), // speed is now velocity
          styleId: getRandomNumber(1, 3),
      }
    }));

    return newTarget;
  }, [speedMultiplier]);

  const nextRound = useCallback((currentTrial: number) => {
    setFeedbackCloudId(null);
    setCorrectCloudId(null);
    const newTarget = generateClouds(currentTrial);
    setTimeout(() => speak(`Let's find the number... ${newTarget}!`, { muted: isMuted, rate: 1, pitch: 1.1 }), 500);
  }, [generateClouds, speak, isMuted]);
  
  const createParticles = useCallback((x: number, y: number, type: 'explosion' | 'confetti' = 'explosion') => {
    const newParticles: ParticleType[] = [];
    if (type === 'explosion') {
      const colors = ['#FFD700', '#FFFFFF', '#FFC300'];
      for (let i = 0; i < 15; i++) {
          const angle = Math.random() * Math.PI * 2;
          const velocity = Math.random() * 3 + 1;
          newParticles.push({
              id: Math.random() + i + Date.now(),
              x, y,
              vx: Math.cos(angle) * velocity,
              vy: Math.sin(angle) * velocity - 2, // Initial upward push
              opacity: 1,
              size: Math.random() * 5 + 3,
              color: colors[Math.floor(Math.random() * colors.length)]
          });
      }
    } else { // 'confetti'
      const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
      for (let i = 0; i < 100; i++) {
          newParticles.push({
              id: Math.random() + i + Date.now(),
              x: Math.random() * 100,
              y: -10 - Math.random() * 20,
              vx: Math.random() * 4 - 2, // horizontal drift
              vy: Math.random() * 2 + 1,  // initial downward velocity
              opacity: 1,
              size: Math.random() * 8 + 5,
              color: colors[Math.floor(Math.random() * colors.length)]
          });
      }
    }
    setParticles(p => [...p, ...newParticles]);
  }, []);

  const gameLoop = useCallback(() => {
    if (isPaused) {
        animationFrameId.current = requestAnimationFrame(gameLoop);
        return;
    }

    setClouds(prevClouds => prevClouds.map(cloud => {
        let newX = cloud.x + cloud.speed; // Speed can be negative

        // Wrap around logic
        if (cloud.speed > 0 && newX > 130) { // Moving right, went off right edge
            newX = -30;
        } else if (cloud.speed < 0 && newX < -30) { // Moving left, went off left edge
            newX = 130;
        }

        return { ...cloud, x: newX };
    }));
    
    const gravity = 0.08;
    setParticles(prev => prev.map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + gravity, // Apply gravity
            opacity: p.opacity - 0.015,
        })).filter(p => p.opacity > 0 && p.y < 110)); // Remove if off-screen or faded

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [isPaused]);

  useEffect(() => {
    if (gameState === 'playing' && !isPaused) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameState, gameLoop, isPaused]);
  
  useEffect(() => {
    if (gameState === 'end') {
        speak(`Wow! You got ${score} out of ${TOTAL_TRIALS}! Fantastic job!`, { muted: isMuted, rate: 1, pitch: 1.2 });
    }
  }, [gameState, score, speak, isMuted]);

  // --- Audio Hooks ---
  useEffect(() => {
    if (gameState === 'playing') {
      playMusic();
    } else {
      stopMusic();
    }
  }, [gameState, playMusic, stopMusic]);

  useEffect(() => {
    setMusicMuted(isMuted);
  }, [isMuted, setMusicMuted]);
  

  // --- Event Handlers ---
  const startGame = () => {
    setScore(0);
    setTrial(1);
    setGameState('playing');
    setParticles([]);
    setIsTransitioning(false);
    setIsPaused(false);
    nextRound(1);
  };
  
  const resetGame = () => {
    setGameState('start');
    setScore(0);
    setTrial(0);
    setClouds([]);
    setTargetNumber(null);
    setIsPaused(false);
  };

  const restartGame = useCallback(() => {
    if (isTransitioning) return;
    setIsPaused(false);
    setScore(0);
    setTrial(1);
    setParticles([]);
    setIsTransitioning(false);
    nextRound(1);
  }, [isTransitioning, nextRound]);
  
  const handleCloudClick = (clickedCloud: CloudType) => {
    if (isTransitioning || isPaused) return;

    setIsTransitioning(true);

    if (clickedCloud.number === targetNumber) {
      playSound('correct', isMuted);
      createParticles(clickedCloud.x, clickedCloud.y, 'explosion');
      createParticles(0, 0, 'confetti'); // x,y are ignored for confetti
      setScore(s => s + 1);
      setCorrectCloudId(clickedCloud.id);
    } else {
      playSound('incorrect', isMuted);
      setFeedbackCloudId(clickedCloud.id);
    }

    setTimeout(() => {
      if (trial >= TOTAL_TRIALS) {
        setGameState('end');
      } else {
        const nextTrial = trial + 1;
        setTrial(nextTrial);
        nextRound(nextTrial);
      }
      setIsTransitioning(false);
    }, 1500);
  };

  return (
    <main className="h-screen w-screen overflow-hidden relative font-sans text-slate-800 flex items-center justify-center"
          style={{ 
            cursor: gameState === 'playing' ? `url(${dragonCursor}) 4 8, auto` : 'default',
            background: 'linear-gradient(to bottom, #87CEEB 0%, #B0E0E6 100%)'
          }}
    >
      <Sun />
      
      {gameState === 'start' && <StartScreen onStart={startGame} speed={speedMultiplier} onSpeedChange={setSpeedMultiplier} />}
      {gameState === 'end' && <EndScreen score={score} onPlayAgain={resetGame} />}

      {gameState === 'playing' && (
        <>
          <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center flex-wrap text-white z-20 bg-black/20 text-shadow-md pointer-events-none">
            {/* Left: Score */}
            <div className="order-1 flex items-center bg-white/30 backdrop-blur-sm rounded-full px-4 py-2">
              <StarIcon />
              <span className="text-4xl font-bold">{score}</span>
            </div>

            {/* Center: Prompt - On mobile, this will take full width and be the last item, creating a new row */}
            <div className="order-3 w-full md:order-2 md:w-auto flex flex-col items-center mt-4 md:mt-0">
                {targetNumber !== null && (
                  <h2 className="text-4xl font-bold animate-pulse">Find: <span className="text-yellow-300">{targetNumber}</span></h2>
                )}
                 <div className="text-2xl font-semibold bg-black/20 px-3 py-1 rounded-md mt-1">Trial: {trial} / {TOTAL_TRIALS}</div>
            </div>

            {/* Right: Buttons */}
            <div className="order-2 md:order-3 flex items-center gap-2 pointer-events-auto">
              <button onClick={() => speak(`Let's find the number... ${targetNumber}!`, { muted: isMuted, rate: 1, pitch: 1.1 })} className="bg-white/30 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition disabled:opacity-50" aria-label="Repeat prompt" disabled={isTransitioning}>
                <SpeakerIcon />
              </button>
              <button onClick={() => setIsMuted(m => !m)} className="bg-white/30 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition" aria-label={isMuted ? "Unmute audio" : "Mute audio"}>
                {isMuted ? <MutedIcon /> : <SpeakerIcon />}
              </button>
               <button onClick={() => setIsPaused(p => !p)} className="bg-white/30 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition disabled:opacity-50" aria-label={isPaused ? "Resume game" : "Pause game"} disabled={isTransitioning}>
                {isPaused ? <ResumeIcon /> : <PauseIcon />}
              </button>
              <button onClick={restartGame} className="bg-white/30 backdrop-blur-sm rounded-full p-3 hover:bg-white/40 transition disabled:opacity-50" aria-label="Restart game" disabled={isTransitioning}>
                <RestartIcon />
              </button>
              <button onClick={resetGame} className="bg-red-500/50 backdrop-blur-sm rounded-full p-3 hover:bg-red-500/70 transition disabled:opacity-50" aria-label="Stop game" disabled={isTransitioning}>
                <StopIcon />
              </button>
            </div>
          </header>

          {particles.map(p => (
            <div key={p.id} className="absolute rounded-full" style={{
                left: `calc(${p.x}% - ${p.size/2}px)`,
                top: `calc(${p.y}% - ${p.size/2}px)`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: p.color,
                opacity: p.opacity,
                transform: 'translate(-50%, -50%)',
                zIndex: 30
            }} />
          ))}

          {clouds.map(cloud => (
            <Cloud
              key={cloud.id}
              cloudData={cloud}
              onClick={handleCloudClick}
              isIncorrect={feedbackCloudId === cloud.id}
              isCorrect={correctCloudId === cloud.id}
            />
          ))}
        </>
      )}
    </main>
  );
}

//
