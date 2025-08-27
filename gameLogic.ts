export const TOTAL_TRIALS = 10;
export const NUM_CLOUDS = 8;

export interface LevelConfig {
  minSpeed: number;
  maxSpeed: number;
  numberRange: [number, number];
}

export const getLevelConfig = (trial: number): LevelConfig => {
  const numberRange: [number, number] = [1, 10]; // All levels use numbers 1-10

  if (trial > 7) { // Trials 8, 9, 10 (Hard)
    return { minSpeed: 0.08, maxSpeed: 0.20, numberRange };
  }
  if (trial > 4) { // Trials 5, 6, 7 (Medium)
    return { minSpeed: 0.06, maxSpeed: 0.16, numberRange };
  }
  // Trials 1, 2, 3, 4 (Easy)
  return { minSpeed: 0.04, maxSpeed: 0.12, numberRange };
};

export const getRandomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const getRandomSpeed = (min: number, max: number, multiplier: number) => (Math.random() * (max - min) + min) * multiplier;