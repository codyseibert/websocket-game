export const TILE_SIZE: number = 128;
export const INTERPOLATION_RATE: number = 120;
export const PLAYER_WIDTH: number = 32;
export const PLAYER_HEIGHT: number = 48;
export const DRAW_HITBOX: boolean = false;
export const MOCK_PING_DELAY: number | null = process.env.MOCK_PING_DELAY
  ? parseInt(process.env.MOCK_PING_DELAY)
  : null;
