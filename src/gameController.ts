import { TICK_RATE } from "./constants";
import random from "random-name";
import { getHumanSpawn, getZombieSpawn, loadMap } from "./mapController";
import {
  emitPlayers,
  emitGameState,
  getControlsForPlayer,
} from "./socketController";
import { handleWaitingState } from "./states/waitingState";
import { handlePlayingState } from "./states/playingState";
import { handleGamePhysics } from "./physicsController";
import { handleMidGameState } from "./states/midGameState";
import { handlePortalLogic } from "./portalController";

export let players: TPlayer[] = [];

export enum GAME_STATE {
  WaitingForPlayers = "WAITING_FOR_PLAYERS",
  Playing = "PLAYING",
  MidGame = "MIDGAME",
}

export enum Teams {
  Humans = "HUMANS",
  Zombies = "ZOMBIES",
}

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
    facingRight: true,
    health: 3,
    lastHit: 0,
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

const getProcessMs = () => {
  const hrTime = process.hrtime();
  return (hrTime[0] * 1e9 + hrTime[1]) / 1e6;
};

const tick = (delta: number) => {
  handleGamePhysics(players, delta);
  handlePortalLogic(players);

  if (gameState === GAME_STATE.MidGame) {
    handleMidGameState();
  } else if (gameState === GAME_STATE.WaitingForPlayers) {
    handleWaitingState(players);
  } else if (gameState === GAME_STATE.Playing) {
    handlePlayingState(players);
  }

  // reset controls
  for (const player of players) {
    const controls = getControlsForPlayer(player.id);
    Object.assign(controls, {
      up: false,
      down: false,
      left: false,
      right: false,
      use: false,
      jump: false,
    });
  }

  emitPlayers(players);
};

loadMap("default");

let lastUpdate = getProcessMs();
setInterval(() => {
  const now = getProcessMs();
  const delta = now - lastUpdate;
  tick(delta);
  lastUpdate = now;
}, 1000 / TICK_RATE);
