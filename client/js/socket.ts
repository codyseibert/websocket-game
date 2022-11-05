import { io } from "socket.io-client";
import { MOCK_PING_DELAY } from "./constants";
import { CTR_ACTIONS } from "./controls";
import { setGameState } from "./game";
import {
  setPingTimeMs,
  setTimeLeft,
  setWaitingTime,
  setWonMessage,
  trackDeath,
} from "./hud";
import { setMap } from "./map";
import { clearPlayers, refreshPlayersState, removePlayer } from "./player";

const socket = io(process.env.WS_SERVER ?? "ws://localhost:3000");

let myPlayerId: number | null = null;

let zombieKills: { name: string, kills: 0 }[] = [];

export const getZombieKills = () => {
  return zombieKills;
}

let humansSurvived: string[] = [];

export const getHumansSurvived = () => {
  return humansSurvived;
}

const emit = (eventName: string, value: any) => {
  if (MOCK_PING_DELAY) {
    setTimeout(() => {
      socket.emit(eventName, value);
    }, MOCK_PING_DELAY);
  } else {
    socket.emit(eventName, value);
  }
};

socket.on("map", (serverMap: TGameMap) => {
  setMap(serverMap);
});

socket.on("death", (deathEvent) => {
  trackDeath(deathEvent);
});

socket.on("playerLeft", (playerId: number) => {
  removePlayer(playerId);
});

socket.on("zombieKillMap", (killMap) => {
  zombieKills = [];
  for (const zombie of killMap) {
    zombieKills.push({ name: zombie.name, kills: zombie.kills });
  }
})

socket.on("humansSurvived", (humans) => {
  humansSurvived = humans;
  console.log(humansSurvived);
})

socket.on("zombieKillMap", (killMap) => {
  zombieKills = [];
  for (const zombie of killMap) {
    zombieKills.push({ name: zombie.name, kills: zombie.kills });
  }
})

socket.on("gameState", (serverGameState) => {
  setGameState(serverGameState);
});

socket.on("timeLeft", (time) => {
  setTimeLeft(time);
});

socket.on("waitingTime", (time) => {
  setWaitingTime(time);
});

socket.on("wonMessage", (message: string) => {
  setWonMessage(message);
});

socket.on("p", (serverPlayers) => {
  refreshPlayersState(serverPlayers);
});

socket.on("id", (playerId: number) => {
  myPlayerId = playerId;
});

socket.on("pong", (initialTime: number) => {
  setPingTimeMs(Date.now() - initialTime);
});

socket.on("disconnect", () => {
  clearPlayers();
});

export function getMyPlayerId() {
  return myPlayerId;
}

let lastSentControls = 0;

export function emitControls(activeControls) {
  const LEFT_BIT = 1 << 0;
  const RIGHT_BIT = 1 << 1;
  let controlByte = 0;
  controlByte |= activeControls[CTR_ACTIONS.LEFT] ? LEFT_BIT : 0;
  controlByte |= activeControls[CTR_ACTIONS.RIGHT] ? RIGHT_BIT : 0;

  if (controlByte !== lastSentControls) {
    emit("c", controlByte);
    lastSentControls = controlByte;
  }

  if (activeControls[CTR_ACTIONS.JUMP]) {
    emitJump();
  }

  if (activeControls[CTR_ACTIONS.USE]) {
    emitUse();
    activeControls[CTR_ACTIONS.USE] = false;
  }
}

export function emitRequestPingTime() {
  emit("ping", Date.now());
}

export function emitJump() {
  emit("jump", null);
}

export function emitUse() {
  emit("use", null);
}
