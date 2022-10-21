export const PORT = process.env.PORT || 3000;
export const GRAVITY = 0.0428;
export const TICK_RATE = 30;
export const TILE_SIZE = 128;
export const COIN_SIZE = 6;
export const PLAYER_SPEED = 0.2;
export const END_GAME_SCORE = 10;
export const COIN_SPAWN_RATE = 500;
export const PLAYER_SIZE = 16;
export const LIMIT_IP = process.env.NODE_ENV === "production" ? true : false;
export const CONTROLS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  JUMP: "jump",
};
export const JUMP_SPEED = -22;
