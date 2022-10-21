import { isCollidingWithMap } from "./geom";

import {
  TICK_RATE,
  CONTROLS,
  PLAYER_SPEED,
  GRAVITY,
  JUMP_SPEED,
  TILE_SIZE,
} from "./constants";
import random from "random-name";

import { getCollidables, getMap, loadMap } from "./mapController";
import { emitPlayers, getControlsForPlayer } from "./socketController";

export let players: TPlayer[] = [];
const canJump: Record<string, boolean> = {};

export const removePlayer = (id: string) => {
  players = players.filter((player) => player.id !== id);
};

export function createPlayer(id: string) {
  const player = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    score: 0,
    name: random.first(),
    id,
    color: `#${Math.floor(Math.random() * (0xffffff + 1)).toString(16)}`,
  };
  players.push(player);
  return player;
}

const tick = (delta: number) => {
  for (const player of players) {
    const playerControls = getControlsForPlayer(player.id) ?? {};

    if (playerControls[CONTROLS.RIGHT]) {
      player.x += PLAYER_SPEED * delta;

      if (isCollidingWithMap(player, getCollidables())) {
        player.x -= PLAYER_SPEED * delta;
      }
    } else if (playerControls[CONTROLS.LEFT]) {
      player.x -= PLAYER_SPEED * delta;

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

    if (player.y > getMap().length * TILE_SIZE * 2) {
      player.x = 100;
      player.y = 100;
      player.vy = 0;
    }
  }

  emitPlayers(players);
};

loadMap("default");

let lastUpdate = Date.now();
setInterval(() => {
  const now = Date.now();
  tick(now - lastUpdate);
  lastUpdate = now;
}, 1000 / TICK_RATE);
