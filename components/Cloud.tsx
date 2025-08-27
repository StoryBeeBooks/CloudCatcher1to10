
import React from 'react';
import type { CloudType } from '../types';

interface CloudProps {
  cloudData: CloudType;
  onClick: (cloud: CloudType) => void;
  isIncorrect: boolean;
  isCorrect: boolean;
}

export const Cloud: React.FC<CloudProps> = ({ cloudData, onClick, isIncorrect, isCorrect }) => {
  let feedbackAnimationClasses = '';
  if (isCorrect) {
    feedbackAnimationClasses = 'animate-correct-pop';
  } else if (isIncorrect) {
    feedbackAnimationClasses = 'animate-shake';
  }
  
  const cloudGlowClasses = isIncorrect ? 'cloud-glow-red' : '';
  const numberClasses = isIncorrect ? 'text-red-500' : 'text-slate-800';

  // --- Style Variations ---
  const { styleId = 1 } = cloudData;
  let scale = 1.0;
  let bobDuration = '5s';

  switch(styleId) {
    case 2: // Larger, slower
      scale = 1.15;
      bobDuration = '7s';
      break;
    case 3: // Smaller, faster
      scale = 0.9;
      bobDuration = '4.5s';
      break;
    // Default case 1 uses initial values
  }
  
  // Define custom animations using a style tag
  const customKeyframes = `
    @keyframes shake {
      10%, 90% { transform: translate3d(-1px, 0, 0) rotate(-1deg); }
      20%, 80% { transform: translate3d(2px, 0, 0) rotate(2deg); }
      30%, 50%, 70% { transform: translate3d(-4px, 0, 0) rotate(-2deg); }
      40%, 60% { transform: translate3d(4px, 0, 0) rotate(2deg); }
    }
    .animate-shake {
      animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
    }

    @keyframes bob {
      50% { transform: translateY(-8px); }
    }
    .animate-bob {
      animation-name: bob;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }

    /* --- New & Updated Feedback Styles --- */
    @keyframes correct-pop {
      from { transform: scale(1); opacity: 1; }
      to { transform: scale(1.3); opacity: 0; }
    }
    .animate-correct-pop {
      animation: correct-pop 0.6s ease-out forwards;
      z-index: 50; /* Ensure it's on top while animating */
    }
    .cloud-glow-red {
       filter: drop-shadow(0 0 12px #ef4444);
       transition: filter 0.3s ease-in-out;
    }
    /* --- CSS Cloud --- */
    .css-cloud-base {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: absolute;
        background: #fff;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .css-cloud-shape1 {
        width: 60%; height: 60%; top: 20%; left: 20%;
    }
    .css-cloud-shape1::before, .css-cloud-shape1::after {
        content: ''; position: absolute; background: #fff; border-radius: 50%;
    }
    .css-cloud-shape1::before {
        width: 65%; height: 65%; top: -30%; left: -20%;
    }
    .css-cloud-shape1::after {
        width: 85%; height: 85%; top: -10%; right: -30%;
    }
    .css-cloud-shape2 {
        width: 70%; height: 50%; top: 25%; left: 15%; border-radius: 100px;
    }
    .css-cloud-shape2::before, .css-cloud-shape2::after {
        content: ''; position: absolute; background: #fff; border-radius: 50%;
    }
    .css-cloud-shape2::before {
        width: 50%; height: 100%; top: -50%; left: 10%;
    }
    .css-cloud-shape2::after {
        width: 60%; height: 120%; top: -20%; right: 5%;
    }
    .css-cloud-shape3 {
        width: 55%; height: 55%; top: 22%; left: 22%;
    }
    .css-cloud-shape3::before, .css-cloud-shape3::after {
        content: ''; position: absolute; background: #fff; border-radius: 50%;
    }
    .css-cloud-shape3::before {
        width: 100%; height: 100%; top: -25%; left: -40%;
    }
    .css-cloud-shape3::after {
        width: 100%; height: 100%; top: -25%; right: -40%;
    }
  `;
  
  let cloudShapeClass = 'css-cloud-shape1';
  if (styleId === 2) cloudShapeClass = 'css-cloud-shape2';
  if (styleId === 3) cloudShapeClass = 'css-cloud-shape3';
  
  const animationDelay = (cloudData.id % 5000) / 1000; // 0-5s delay

  return (
    <>
      <style>{customKeyframes}</style>
      <div
        className="absolute transition-opacity duration-500"
        style={{
          left: `${cloudData.x}%`,
          top: `${cloudData.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={() => onClick(cloudData)}
      >
        <div className={feedbackAnimationClasses}>
          <div 
            className={`animate-bob relative w-48 h-32 cursor-pointer group transition-transform duration-300 hover:scale-105 ${cloudGlowClasses}`}
            style={{ 
              animationDelay: `${animationDelay}s`,
              animationDuration: bobDuration,
              transform: `scale(${scale})`
            }}
          >
              <div className={`css-cloud-base ${cloudShapeClass}`} aria-hidden="true"></div>
              
              <div className={`absolute flex items-center justify-center inset-0 font-bold text-7xl select-none z-10 transition-colors duration-300 ${numberClasses}`} style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'cursive'" }}>
                  {cloudData.number}
              </div>
          </div>
        </div>
      </div>
    </>
  );
};
