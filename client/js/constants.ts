export const TILE_SIZE: number = 128;
export const PLAYER_WIDTH: number = 32;
export const PLAYER_HEIGHT: number = 48;
export const INTERPOLATION_SPEED: number = 7;
export const INTERPOLATE_RATE: number = 60;
export const DRAW_HITBOX: boolean = true;
export const MOCK_PING_DELAY: number | null = process.env.MOCK_PING_DELAY
  ? parseInt(process.env.MOCK_PING_DELAY)
  : null;
