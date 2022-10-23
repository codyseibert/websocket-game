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
import {
  getCollidables,
  getHumanSpawn,
  getMap,
  getZombieSpawn,
  loadMap,
} from "./mapController";
import {
  emitPlayers,
  getControlsForPlayer,
  emitGameState,
} from "./socketController";
import { handleWaitingState } from "./states/waitingState";
import { handlePlayingState } from "./states/playingState";

export let players: TPlayer[] = [];
const canJump: Record<string, boolean> = {};

export const getTimeLeft = () => {
  return timeLeft;
};

export enum GAME_STATE {
  WaitingForPlayers = "WAITING_FOR_PLAYERS",
  Playing = "PLAYING",
  MidGame = "MIDGAME",
}

export enum Teams {
  Humans = "HUMANS",
  Zombies = "ZOMBIES",
}

let timeLeft = 0;
let gameStartTime = 0;
let gameState: GAME_STATE = GAME_STATE.WaitingForPlayers;

let waitingTime = 0;
let won = "";

export const removePlayer = (id: string) => {
  players = players.filter((player) => player.id !== id);
};

export function createPlayer(id: string) {
  const player: TPlayer = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    score: 0,
    name: random.first(),
    isZombie: false,
    id,
    color: `#${Math.floor(Math.random() * (0xffffff + 1)).toString(16)}`,
  };
  players.push(player);
  return player;
}

export const respawnPlayers = () => {
  for (const player of players) {
    const spawnPoint = player.isZombie ? getZombieSpawn() : getHumanSpawn();
    player.x = spawnPoint.x;
    player.y = spawnPoint.y;
    player.vx = 0;
    player.vy = 0;
  }
};

export const getGameState = () => {
  return gameState;
};

export const getWhoWon = () => {
  return won;
};

export const getWaitingTime = () => {
  return waitingTime;
};

export const setGameState = (newState: GAME_STATE) => {
  gameState = newState;
  emitGameState(gameState);
};

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

  if (gameState === GAME_STATE.WaitingForPlayers) {
    handleWaitingState(players);
  } else if (gameState === GAME_STATE.Playing) {
    handlePlayingState(players, gameStartTime);
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
