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
  grid: number[][];
  tileset: {
    image: string;
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
  };
};
