import {
  GAME_STATE,
  respawnPlayers,
  setGameState,
  Teams,
} from "../gameController";
import { emitMidGameTime, emitWonMessage } from "../socketController";
import { startGame } from "./playingState";

export const goToMidGameState = async (winner: Teams, players) => {
  emitWonMessage(winner);
  setGameState(GAME_STATE.MidGame);

  let waitingTime = 5;
  emitMidGameTime(waitingTime);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  for (let i = 4; i > 0; i--) {
    waitingTime = i;
    emitMidGameTime(waitingTime);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  startGame(players);
};
