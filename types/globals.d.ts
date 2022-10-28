declare module "*.png";

type TPlayer = {
  id: number;
  x: number;
  y: number;
  score: number;
  vx: number;
  vy: number;
  color: string;
  name: string;
  isZombie: boolean;
  facingRight: boolean;
  health: number;
  lastHit: number;
};

type TGameMap = {
  grid: {
    tiles: number[][];
    metadata: {
      width: number;
      height: number;
      tileWidth: number;
      tileHeight: number;
    };
  };
  decals: {
    tiles: number[][];
    metadata: {
      width: number;
      height: number;
      tileWidth: number;
      tileHeight: number;
    };
  };
};

type TPoint = {
  x: number;
  y: number;
};
