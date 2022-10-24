import { MID_GAME_LENGTH } from "../constants";
import {
  GAME_STATE,
  respawnPlayers,
  setGameState,
  Teams,
} from "../gameController";
import { emitMidGameTime, emitWonMessage } from "../socketController";
import { startGame, turnHuman } from "./playingState";

const turnPurpleHuman = (player) => {
  turnHuman(player);
  player.color = "#FF00FF";
};

export const goToMidGameState = async (winner: Teams, players) => {
  emitWonMessage(winner);
  setGameState(GAME_STATE.MidGame);
  players.forEach(turnPurpleHuman);
  respawnPlayers();

  let timeLeft = MID_GAME_LENGTH / 1000;
  emitMidGameTime(timeLeft);
  const midGameInterval = setInterval(() => {
    timeLeft--;
    emitMidGameTime(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(midGameInterval);
      startGame(players);
    }
  }, 1000);
};

export const handleMidGameState = () => {};
