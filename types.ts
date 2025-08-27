export interface CloudType {
  id: number;
  number: number;
  x: number;
  y: number;
  speed: number;
  styleId: number;
}

export interface ParticleType {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  color: string;
}