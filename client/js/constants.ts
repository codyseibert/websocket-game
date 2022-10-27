export const TILE_SIZE: number = 128;
export const INTERPOLATION_SPEED: number = 0.05;
export const PLAYER_WIDTH: number = 32;
export const PLAYER_HEIGHT: number = 48;
export const DRAW_HITBOX: boolean = false;
export const MOCK_PING_DELAY: number | null =
  process.env.NODE_ENV === "production" ? null : 100;
