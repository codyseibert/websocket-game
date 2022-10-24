import { PLAYERS_NEEDED } from "../constants";
import {
  GAME_STATE,
  respawnPlayers,
  setGameState,
  Teams,
} from "../gameController";
import { emitWonMessage } from "../socketController";
import { startGame } from "./playingState";

export function handleWaitingState(players) {
  const shouldStartGame = players.length >= PLAYERS_NEEDED;
  if (shouldStartGame) {
    startGame(players);
  }
}

export const gotoWaitingState = (winner: Teams, players) => {
  for (const player of players) {
    player.isZombie = false;
    player.color = "#FF00FF";
  }
  setGameState(GAME_STATE.WaitingForPlayers);
  emitWonMessage(winner);
};
