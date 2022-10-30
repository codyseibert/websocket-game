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

  const futureY = player.y + player.vy * delta;

  if (
    player.vy > 0 &&
    isCollidingWithMap({ ...player, y: futureY }, getCollidables())
  ) {
    canJump[player.id] = true;
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
    canJump[player.id] = false;
    player.y += player.vy * delta;
    player.vy += GRAVITY * delta;
  }
}

function handlePlayerJump(player: TPlayer) {
  const playerControls: TControlMap = getControlsForPlayer(player.id);

  if (playerControls[CONTROLS.JUMP] && canJump[player.id]) {
    player.vy = JUMP_SPEED;
    canJump[player.id] = false;
  }
  playerControls[CONTROLS.JUMP] = false;
}

function handlePlayerFallToDeath(player: TPlayer) {
  if (player.y > getGameMap().grid.tiles.length * TILE_SIZE * 2) {
    player.x = 100;
    player.y = 100;
    player.vx = 0;
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
