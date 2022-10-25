declare module "*.png";

type TPlayer = {
  id: string;
  x: number;
  y: number;
  score: number;
  vx: number;
  vy: number;
  color: string;
  name: string;
  isZombie: boolean;
  facingRight: boolean;
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
