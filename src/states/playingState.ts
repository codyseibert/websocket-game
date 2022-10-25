import {
  GAME_LENGTH,
  HUMAN_COLOR,
  PLAYERS_NEEDED,
  ZOMBIE_COLOR,
} from "../constants";
import {
  GAME_STATE,
  respawnPlayers,
  setGameState,
  Teams,
} from "../gameController";
import { getPlayerBoundingBox, isOverlap } from "../geom";
import { emitTimeLeft } from "../socketController";
import { goToMidGameState } from "./midGameState";
import { gotoWaitingState } from "./waitingState";
import { performance } from "perf_hooks";

let gameStartTime: number;
let timeLeft: number;
let timeLeftInterval: NodeJS.Timeout;

export const startGame = (players: TPlayer[]) => {
  timeLeft = GAME_LENGTH / 1000;
  emitTimeLeft(timeLeft);
  players.forEach(turnHuman);
  pickZombie(players);
  respawnPlayers();
  setGameState(GAME_STATE.Playing);

  const setTimeLeft = () => {
    timeLeft--;
    emitTimeLeft(timeLeft);
  };

  timeLeftInterval = setInterval(setTimeLeft, 1000);
};

export const turnHuman = (player) => {
  player.color = HUMAN_COLOR;
  player.isZombie = false;
};

export const turnZombie = (player) => {
  player.color = ZOMBIE_COLOR;
  player.isZombie = true;
};

const pickZombie = (players) => {
  const zombie = players[Math.floor(Math.random() * players.length)];
  turnZombie(zombie);
};

export function handlePlayingState(players) {
  const noMoreZombies = players.every((player) => !player.isZombie);
  const noMoreHumans = players.every((player) => player.isZombie);

  if (noMoreZombies || timeLeft <= 0) {
    endGame(Teams.Humans, players);
  } else if (noMoreHumans) {
    endGame(Teams.Zombies, players);
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

export function endGame(won: Teams, players) {
  clearInterval(timeLeftInterval);
  emitTimeLeft(0);
  if (players.length >= PLAYERS_NEEDED) {
    goToMidGameState(won, players);
  } else {
    gotoWaitingState(won, players);
  }
}
