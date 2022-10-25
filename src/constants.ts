export const PORT: string | number = process.env.PORT || 3000;
export const GRAVITY: number = 0.0428;
export const TICK_RATE: number = 30;
export const TILE_SIZE: number = 128;
export const COIN_SIZE: number = 6;
export const PLAYER_SPEED: number = 0.5;
export const ZOMBIE_SPEED: number = 0.4;
export const END_GAME_SCORE: number = 10;
export const COIN_SPAWN_RATE: number = 500;
export const GAME_LENGTH: number = 30000;
export const PLAYERS_NEEDED: number = 2;
export const MID_GAME_LENGTH: number = 5000;
export const HUMAN_COLOR: string = "#FF0000";
export const ZOMBIE_COLOR: string = "#00FF00";
export const PLAYER_WIDTH: number = 32;
export const PLAYER_HEIGHT: number = 48;
export const LIMIT_IP: boolean =
  process.env.NODE_ENV === "production" ? true : false;
export const PING_REQUEST_INTERVAL:number = 5000; // in ms
export const JUMP_SPEED: number = -29;

export enum CONTROLS {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  JUMP = "jump",
  USE = "use",
}
