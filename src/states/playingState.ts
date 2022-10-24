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

let gameStartTime;
let timeLeft;
let timeLeftInterval;

export const startGame = (players: TPlayer[]) => {
  setGameState(GAME_STATE.Playing);
  gameStartTime = performance.now();
  timeLeft = GAME_LENGTH / 1000;
  emitTimeLeft(timeLeft);
  players.forEach(turnHuman);
  pickZombie(players);
  respawnPlayers();
  timeLeftInterval = setInterval(setTimeLeft, 1000);
};

const turnHuman = (player) => {
  player.color = HUMAN_COLOR;
  player.isZombie = false;
};

const turnZombie = (player) => {
  player.color = ZOMBIE_COLOR;
  player.isZombie = true;
};

const pickZombie = (players) => {
  const zombie = players[Math.floor(Math.random() * players.length)];
  turnZombie(zombie);
};

export function handlePlayingState(players, gameStartTime) {
  const noMoreZombies = players.every((player) => !player.isZombie);
  const noMoreHumans = players.every((player) => player.isZombie);

  if (noMoreZombies || performance.now() - gameStartTime >= GAME_LENGTH) {
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

const setTimeLeft = () => {
  timeLeft = Math.ceil(
    (GAME_LENGTH - (performance.now() - gameStartTime)) / 1000
  );
  emitTimeLeft(timeLeft);
};
