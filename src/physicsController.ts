import {
  CONTROLS,
  GRAVITY,
  JUMP_SPEED,
  PLAYER_SPEED,
  TILE_SIZE,
} from "./constants";
import { isCollidingWithMap } from "./geom";
import { getCollidables, getGameMap } from "./mapController";
import { getControlsForPlayer } from "./socketController";

const canJump: Record<string, boolean> = {};

export const handleGamePhysics = (players: TPlayer[], delta: number) => {
  for (const player of players) {
    const playerControls = getControlsForPlayer(player.id) ?? {};

    if (playerControls[CONTROLS.RIGHT]) {
      player.x += PLAYER_SPEED * delta;
      player.facingRight = true;

      if (isCollidingWithMap(player, getCollidables())) {
        player.x -= PLAYER_SPEED * delta;
      }
    } else if (playerControls[CONTROLS.LEFT]) {
      player.x -= PLAYER_SPEED * delta;
      player.facingRight = false;

      if (isCollidingWithMap(player, getCollidables())) {
        player.x += PLAYER_SPEED * delta;
      }
    }

    player.vy += GRAVITY * delta;
    player.y += player.vy;
    if (isCollidingWithMap(player, getCollidables())) {
      if (player.vy > 0) {
        canJump[player.id] = true;
      }
      player.y -= player.vy;
      player.vy = 0;
    }

    if (playerControls[CONTROLS.JUMP] && canJump[player.id]) {
      canJump[player.id] = false;
      player.vy = JUMP_SPEED;
    }

    if (player.y > getGameMap().grid.tiles.length * TILE_SIZE * 2) {
      player.x = 100;
      player.y = 100;
      player.vy = 0;
    }
  }
};
