import { io } from "socket.io-client";
import { MOCK_PING_DELAY } from "./constants";
import { setGameState } from "./game";
import {
  setPingTimeMs,
  setTimeLeft,
  setWaitingTime,
  setWonMessage,
} from "./hud";
import { setMap } from "./map";
import { setPlayers } from "./player";

const socket = io(process.env.WS_SERVER ?? "ws://localhost:3000");

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

socket.on("players", (serverPlayers) => {
  setPlayers(serverPlayers);
});

socket.on("ping", (ping: number) => {
  setPingTimeMs(ping);
});

export function getMyPlayerId() {
  return socket.id;
}

export function emitControls(activeControls) {
  emit("controls", { ...activeControls });
}

export function emitRequestPingTime() {
  emit("requestPingTime", Date.now());
}

export function emitJump() {
  emit("jump", null);
}

export function emitUse() {
  emit("use", null);
}
