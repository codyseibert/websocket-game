import {
  CONTROLS,
  GRAVITY,
  JUMP_SPEED,
  PLAYER_SPEED,
  TControlMap,
  TILE_SIZE,
  ZOMBIE_SPEED,
} from "./constants";
import { isCollidingWithMap } from "./geom";
import { getCollidables, getGameMap } from "./mapController";
import { getControlsForPlayer } from "./socketController";
import { turnZombie } from "./states/playingState";

const canJump: Record<string, boolean> = {};

function handlePlayerXMovement(player: TPlayer, delta: number) {
  const playerControls = getControlsForPlayer(player.id);
  const speed = player.isZombie ? ZOMBIE_SPEED : PLAYER_SPEED;

  if (playerControls[CONTROLS.RIGHT]) {
    player.x += speed * delta;
    player.facingRight = true;

    if (isCollidingWithMap(player, getCollidables())) {
      player.x -= speed * delta;
    }
  } else if (playerControls[CONTROLS.LEFT]) {
    player.x -= speed * delta;
    player.facingRight = false;

    if (isCollidingWithMap(player, getCollidables())) {
      player.x += speed * delta;
    }
  }
}

function handlePlayerYMovement(player: TPlayer, delta: number) {
  player.vy += GRAVITY * delta;
  player.y += player.vy;
  if (isCollidingWithMap(player, getCollidables())) {
    if (player.vy > 0) {
      canJump[player.id] = true;
    }
    player.y -= player.vy;
    player.vy = 0;
  }
}

function handlePlayerJump(player: TPlayer) {
  const playerControls: TControlMap = getControlsForPlayer(player.id);

  if (playerControls[CONTROLS.JUMP] && canJump[player.id]) {
    canJump[player.id] = false;
    player.vy = JUMP_SPEED;
    playerControls[CONTROLS.JUMP] = false;
  }
}

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
    handlePlayerXMovement(player, delta);
    handlePlayerYMovement(player, delta);
    handlePlayerJump(player);
    handlePlayerFallToDeath(player);
  }
};
