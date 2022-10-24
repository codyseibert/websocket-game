import  { PLAYER_SIZE, TILE_SIZE } from "./constants";

type TRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TPoint = {
  x: number;
  y: number;
};

export const isOverlap = (rect1: TRectangle, rect2: TRectangle) => {
  if (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
  ) {
    return true;
  } else {
    return false;
  }
};

const getBoundingBoxFactory = (STATIC_SIZE: number) => (entity) => {
  return {
    width: STATIC_SIZE,
    height: STATIC_SIZE,
    x: entity.x,
    y: entity.y,
  } as TRectangle;
};

export const getPlayerBoundingBox = getBoundingBoxFactory(PLAYER_SIZE);
export const getTileBoundingBox = getBoundingBoxFactory(TILE_SIZE);

export const isCollidingWithMap = (player, collidables) => {
  for (const collidable of collidables) {
    if (
      isOverlap(getPlayerBoundingBox(player), getTileBoundingBox(collidable))
    ) {
      return true;
    }
  }
  return false;
};
