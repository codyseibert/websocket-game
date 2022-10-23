import {
  getPlayerBoundingBox,
  isCollidingWithMap,
  isOverlap,
  TPoint,
} from "./geom";

import {
  TICK_RATE,
  CONTROLS,
  PLAYER_SPEED,
  GRAVITY,
  JUMP_SPEED,
  TILE_SIZE,
  PLAYERS_NEEDED,
  HUMAN_COLOR,
  ZOMBIE_COLOR,
  GAME_LENGTH,
} from "./constants";
import random from "random-name";

import { getCollidables, getMap, loadMap } from "./mapController";
import {
  emitPlayers,
  getControlsForPlayer,
  emitGameState,
  emitTimeLeft,
  emitMidGameTime,
  emitWonMessage,
} from "./socketController";
import { io } from "socket.io-client";

export let players: TPlayer[] = [];
const canJump: Record<string, boolean> = {};

export const getTimeLeft = () => {
  return timeLeft;
}

const ZOMBIE_SPAWN: TPoint = {
  x: 100,
  y: 100,
};

const HUMAN_SPAWN: TPoint = {
  x: 200,
  y: 100,
};

export enum GAME_STATE {
  WaitingForPlayers = "WAITING_FOR_PLAYERS",
  Playing = "PLAYING",
  MidGame = "MIDGAME",
}

let timeLeft = 0;
let gameStartTime = 0;
let gameState: GAME_STATE = GAME_STATE.WaitingForPlayers;

let waitingTime = 0;
let won = '';

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

const gotoWaitingState = (winner: string) => {
  for (const player of players) {
    player.isZombie = false;
    player.color = "#FF00FF";
  }
  gameState = GAME_STATE.WaitingForPlayers;
  respawnPlayers();
  emitGameState(gameState);
  if (winner) {
    won = winner;
    emitWonMessage(winner);
  }
};

const goToMidGameState = async (winner: string) => {
  for (const player of players) {
    player.isZombie = false;
    player.color = "#FF00FF";
  }
  won = winner;
  emitWonMessage(winner);
  gameState = GAME_STATE.MidGame
  respawnPlayers();
  emitGameState(gameState);
  waitingTime = 5;
  emitMidGameTime(waitingTime);
  await new Promise(resolve => setTimeout(resolve, 1000));
  for (let i = 4; i > 0; i--) {
    waitingTime = i;
    emitMidGameTime(waitingTime);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  startGame();
}

const startGame = () => {
  gameState = GAME_STATE.Playing;
  gameStartTime = performance.now();
  timeLeft = GAME_LENGTH / 1000;
  emitTimeLeft(timeLeft);
  players.forEach(turnHuman);
  pickZombie();
  respawnPlayers();
  emitGameState(gameState);
};

const turnHuman = (player) => {
  player.color = HUMAN_COLOR;
  player.isZombie = false;
};

const turnZombie = (player) => {
  player.color = ZOMBIE_COLOR;
  player.isZombie = true;
};

const respawnPlayers = () => {
  for (const player of players) {
    if (player.isZombie) {
      player.x = ZOMBIE_SPAWN.x;
      player.y = ZOMBIE_SPAWN.y;
    } else {
      player.x = HUMAN_SPAWN.x;
      player.y = HUMAN_SPAWN.y;
    }
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

const pickZombie = () => {
  const zombie = players[Math.floor(Math.random() * players.length)];
  turnZombie(zombie);
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
    handleWaitingState();
  } else if (gameState === GAME_STATE.Playing) {
    handlePlayingState();
  }

  emitPlayers(players);
};

function handleWaitingState() {
  const shouldStartGame = players.length >= PLAYERS_NEEDED;
  if (shouldStartGame) {
    startGame();
  }
}

function endGame(won: string) {
  timeLeft = 0;
  emitTimeLeft(timeLeft);
  if (players.length >= PLAYERS_NEEDED) {
    goToMidGameState(won)
  } else {
    gotoWaitingState(won);
  }
}

function handlePlayingState() {
  const noMoreZombies = players.every((player) => !player.isZombie);
  const noMoreHumans = players.every((player) => player.isZombie);

  if (
    noMoreZombies ||
    performance.now() - gameStartTime >= GAME_LENGTH
  ) {
    endGame('Humans');
  } else if (noMoreHumans) {
    endGame('Zombies');
  }

  const zombies = players.filter((player) => player.isZombie);
  const humans = players.filter((player) => !player.isZombie);

  for (const zombie of zombies) {
    for (const human of humans) {
      if (
        isOverlap(getPlayerBoundingBox(zombie), getPlayerBoundingBox(human))
      ) {
        turnZombie(human);
      }
    }
  }
}

loadMap("default");

const setTimeLeft = () => {
  if (gameState == 'PLAYING') {
    timeLeft = Math.ceil((GAME_LENGTH - (performance.now() - gameStartTime)) / 1000);
    emitTimeLeft(timeLeft);
  }
}

setInterval(setTimeLeft, 1000);

let lastUpdate = Date.now();
setInterval(() => {
  const now = Date.now();
  tick(now - lastUpdate);
  lastUpdate = now;
}, 1000 / TICK_RATE);
