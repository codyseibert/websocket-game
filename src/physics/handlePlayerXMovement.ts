import {
  CONTROLS,
  PLAYER_SPEED,
  TControlMap,
  ZOMBIE_SPEED,
} from "../constants";
import { isCollidingWithMap } from "../geom";
import { getCollidables } from "../mapController";

let distance = 0;
export function handlePlayerXMovement(
  player: TPlayer,
  delta: number,
  controls: TControlMap,
  onMoveRight: () => void
) {
  const speed = player.isZombie ? ZOMBIE_SPEED : PLAYER_SPEED;

  if (controls[CONTROLS.RIGHT]) {
    player.x += speed * delta;
    distance += speed * delta;
    player.facingRight = true;
    onMoveRight();

    if (isCollidingWithMap(player, getCollidables())) {
      player.x -= speed * delta;
    }
  } else if (controls[CONTROLS.LEFT]) {
    player.x -= speed * delta;
    player.facingRight = false;

    if (isCollidingWithMap(player, getCollidables())) {
      player.x += speed * delta;
    }
  }
}
