import {
  CONTROLS,
  GRAVITY,
  JUMP_SPEED,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  TControlMap,
  TILE_SIZE,
  ZOMBIE_SPEED,
} from "./constants";
import { isCollidingWithMap } from "./geom";
import { getCollidables, getGameMap } from "./mapController";
import { handlePlayerJump } from "./physics/handlePlayerJump";
import { handlePlayerXMovement } from "./physics/handlePlayerXMovement";
import { handlePlayerYMovement } from "./physics/handlePlayerYMovement";
import { getControlsForPlayer } from "./socketController";
import { turnZombie } from "./states/playingState";

const canJump: Record<string, boolean> = {};

function handlePlayerFallToDeath(player: TPlayer) {
  if (player.y > getGameMap().grid.tiles.length * TILE_SIZE * 2) {
    player.x = 100;
    player.y = 100;
    player.vy = 0;
    if (!player.isZombie) {
      turnZombie(player);
    }
  }
}

export const handleGamePhysics = (players: TPlayer[], delta: number) => {
  for (const player of players) {
    const playerControls = getControlsForPlayer(player.id);
    handlePlayerXMovement(player, delta, playerControls, () => {});
    handlePlayerYMovement(
      player,
      delta,
      () => (canJump[player.id] = true),
      getCollidables
    );
    handlePlayerJump(
      player,
      canJump[player.id],
      playerControls,
      () => (canJump[player.id] = false)
    );
    handlePlayerFallToDeath(player);
  }
};
