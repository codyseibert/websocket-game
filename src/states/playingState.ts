import {
  GAME_LENGTH,
  HUMAN_COLOR,
  PLAYERS_NEEDED,
  ZOMBIE_COLOR,
  HIT_COOLDOWN,
  ZOMBIE_SPEED,
} from "../constants";
import {
  GAME_STATE,
  respawnPlayers,
  setGameState,
  Teams,
} from "../gameController";
import { getPlayerBoundingBox, isOverlap } from "../geom";
import { emitDeath, emitTimeLeft, emitHumansSurvived, emitZombieKillMap } from "../socketController";
import { goToMidGameState } from "./midGameState";
import { gotoWaitingState } from "./waitingState";
import { performance } from "perf_hooks";

let gameStartTime: number;
let timeLeft: number;
let timeLeftInterval: NodeJS.Timeout;

export let won: string;

export let zombieKillMap: { name: string, kills: number }[] = [];

export let humansSurvived: string[] = [];

export const removeZombie = (name: string) => {
  zombieKillMap = zombieKillMap.filter(z => !(z.name == name));
}

export const startGame = (players: TPlayer[]) => {
  zombieKillMap = [];
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
  player.health = 3;
  player.lastHit = 0;
};

export const turnZombie = (player) => {
  player.color = ZOMBIE_COLOR;
  player.isZombie = true;
  zombieKillMap.push({ name: player.name, kills: 0 });
};

const pickZombie = (players: TPlayer[]) => {
  const zombie = players[Math.floor(Math.random() * players.length)];
  turnZombie(zombie);
};

export function handlePlayingState(players: TPlayer[]) {
  const noMoreZombies = players.every((player) => !player.isZombie);
  const noMoreHumans = players.every((player) => player.isZombie);

  if (noMoreZombies || timeLeft <= 0) {
    emitZombieKillMap(zombieKillMap);
    humansSurvived = [];
    players.forEach(player => { if (!player.isZombie) humansSurvived.push(player.name) });
    emitHumansSurvived(humansSurvived);
    endGame(Teams.Humans, players);
  } else if (noMoreHumans) {
    emitZombieKillMap(zombieKillMap);
    humansSurvived = [];
    emitHumansSurvived(humansSurvived);
    endGame(Teams.Zombies, players);
  }

  const zombies = players.filter((player) => player.isZombie);
  const humans = players.filter((player) => !player.isZombie);

  for (const zombie of zombies) {
    for (const human of humans) {
      if (
        isOverlap(getPlayerBoundingBox(zombie), getPlayerBoundingBox(human))
      ) {
        if (performance.now() - human.lastHit > HIT_COOLDOWN) {
          human.health--;
          human.lastHit = performance.now();
          if (!human.health) {
            turnZombie(human);
            emitDeath(zombie.name, human.name);
            let name: string;
            zombieKillMap.forEach(z => { if (z.name == zombie.name) { name = zombie.name; z.kills++ } });
          }
        }
      }
    }
  }
}

export function endGame(teamWon: Teams, players) {
  clearInterval(timeLeftInterval);
  emitTimeLeft(0);
  if (players.length >= PLAYERS_NEEDED) {
    goToMidGameState(teamWon, players);
  } else {
    gotoWaitingState(teamWon, players);
  }
  won = teamWon;
}