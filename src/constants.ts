export const PORT: string | number = process.env.PORT || 3000;
export const GRAVITY: number = 0.001;
export const TICK_RATE: number = 30;
export const TILE_SIZE: number = 128;
export const COIN_SIZE: number = 6;
export const PLAYER_SPEED: number = 0.5;
export const ZOMBIE_SPEED: number = 0.4;
export const END_GAME_SCORE: number = 10;
export const COIN_SPAWN_RATE: number = 500;
export const GAME_LENGTH: number = 1000 * 30 * 3; // 1 min 30 seconds
export const MOCK_PING_DELAY: number | null = process.env.MOCK_PING_DELAY
  ? parseInt(process.env.MOCK_PING_DELAY)
  : null;
export const HIT_COOLDOWN: number = 650;
export const PLAYERS_NEEDED: number = 2;
export const MID_GAME_LENGTH: number = 5000;
export const HUMAN_COLOR: string = "#FF0000";
export const ZOMBIE_COLOR: string = "#00FF00";
export const PLAYER_WIDTH: number = 32;
export const PLAYER_HEIGHT: number = 48;
export const LIMIT_IP: boolean = process.env.ENABLE_IP_LIMIT ? true : false;
export const PING_REQUEST_INTERVAL: number = 1000; // in ms
export const JUMP_SPEED: number = -0.75;

export enum CONTROLS {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  JUMP = "jump",
  USE = "use",
}

export type TControlMap = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  use: boolean;
  jump: boolean;
};
