import { TILE_SIZE, PLAYER_HEIGHT, PLAYER_WIDTH } from "./constants";

type TRectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const isOverlap = (rect1: TRectangle, rect2: TRectangle) => {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
  );
};

const getBoundingRectangleFactory =
  (width: number, height: number) => (entity) => {
    return {
      width,
      height,
      x: entity.x,
      y: entity.y,
    } as TRectangle;
  };

const getBoundingBoxFactory = (STATIC_SIZE: number) => (entity) => {
  return getBoundingRectangleFactory(STATIC_SIZE, STATIC_SIZE)(entity);
};

export const getPlayerBoundingBox = getBoundingRectangleFactory(
  PLAYER_WIDTH,
  PLAYER_HEIGHT
);

export const getPortalBoundingBox = getBoundingRectangleFactory(
  TILE_SIZE,
  TILE_SIZE
);

export const getTileBoundingBox = getBoundingRectangleFactory(
  TILE_SIZE,
  TILE_SIZE / 2
);

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
