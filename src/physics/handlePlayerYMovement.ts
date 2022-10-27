import { GRAVITY, PLAYER_HEIGHT, TILE_SIZE } from "../constants";
import { isCollidingWithMap } from "../geom";

export function handlePlayerYMovement(
  player: TPlayer,
  delta: number,
  setCanJump: () => void,
  getCollidables
) {
  const futureY = player.y + player.vy * delta;
  if (
    player.vy > 0 &&
    isCollidingWithMap({ ...player, y: futureY }, getCollidables())
  ) {
    setCanJump();
    player.y =
      Math.floor((futureY + PLAYER_HEIGHT) / TILE_SIZE) * TILE_SIZE -
      PLAYER_HEIGHT;
    player.vy = 0;
  } else if (
    player.vy < 0 &&
    isCollidingWithMap({ ...player, y: futureY }, getCollidables())
  ) {
    player.vy = 0.2;
  } else {
    player.y += player.vy * delta;
    player.vy += GRAVITY * delta;
  }
}
