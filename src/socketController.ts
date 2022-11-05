import {
  createPlayer,
  GAME_STATE,
  getGameState,
  removePlayer,
  getWaitingTime,
  getWhoWon,
  getPlayers,
} from "./gameController";
import { getGameMap } from "./mapController";
import { Server, Socket } from "socket.io";
import { CONTROLS, LIMIT_IP, MOCK_PING_DELAY, TControlMap } from "./constants";
import { isEmpty, pickBy, identity } from "lodash";
import { zombieKillMap, removeZombie } from "./states/playingState";

let io;
let nextPlayerId = 0;

export function getNextPlayerId() {
  return nextPlayerId++;
}

const controlsMap: Record<number, TControlMap> = {};
const playerSocketMap = {};
const ipSet = new Set<string>();
const socketMap = {};
const playerIdMap: Record<string, number> = {};

function emitToSocket(channel, eventName, value) {
  if (MOCK_PING_DELAY) {
    setTimeout(() => {
      channel.emit(eventName, value);
    }, MOCK_PING_DELAY);
  } else {
    channel.emit(eventName, value);
  }
}

export const getControlsForPlayer = (playerId: number) => {
  if (!controlsMap[playerId]) {
    controlsMap[playerId] = {
      up: false,
      down: false,
      left: false,
      right: false,
      use: false,
      jump: false,
    };
  }
  return controlsMap[playerId];
};

let lastPlayerStates: any[] = [];

export const emitPlayers = (players: any) => {
  const diffs: any[] = [];
  for (let player of players) {
    const lastPlayerState = lastPlayerStates.find((p) => p.id === player.id);
    if (!lastPlayerState) {
      diffs.push(player);
    } else {
      let diff = {
        x: player.x !== lastPlayerState.x ? player.x : undefined,
        y: player.y !== lastPlayerState.y ? player.y : undefined,
        name: player.name !== lastPlayerState.name ? player.name : undefined,
        isZombie:
          player.isZombie !== lastPlayerState.isZombie
            ? player.isZombie
            : undefined,
        facingRight:
          player.facingRight !== lastPlayerState.facingRight
            ? player.facingRight
            : undefined,
        health:
          player.health !== lastPlayerState.health ? player.health : undefined,
      };
      diff = pickBy(diff, (value) => value !== undefined);

      if (!isEmpty(diff)) {
        (diff as any).id = player.id;
        diffs.push(diff);
      }
    }
  }
  if (!isEmpty(diffs)) {
    emitToSocket(io, "p", diffs);
  }
  lastPlayerStates = players.map((p) => ({ ...p }));
};

export const emitGameState = (gameState: GAME_STATE) => {
  emitToSocket(io, "gameState", gameState);
};

export const emitDeath = (zombieName, playerName) => {
  emitToSocket(io, "death", { zombieName, playerName });
};

export const emitMidGameTime = (time: number) => {
  emitToSocket(io, "waitingTime", time);
};

export const emitWonMessage = (message: string) => {
  emitToSocket(io, "wonMessage", message);
};

export const emitTimeLeft = (time: number) => {
  emitToSocket(io, "timeLeft", time);
};

export const emitHumansSurvived = (humans: string[]) => {
  emitToSocket(io, "humansSurvived", humans);
}

export const emitZombieKillMap = (killMap: object[]) => {
  emitToSocket(io, "zombieKillMap", killMap);
}

export const startSocketController = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connect", (socket: Socket) => {
    console.log("a user connected");

    const ipAddress = (socket.handshake.headers["x-forwarded-for"] ??
      socket.handshake.headers["x-real-ip"] ??
      socket.handshake.address) as string;

    if (LIMIT_IP && ipSet.has(ipAddress)) {
      socket.disconnect();
      return;
    }
    ipSet.add(ipAddress);

    emitZombieKillMap(zombieKillMap);
    emitToSocket(socket, "map", getGameMap());
    emitToSocket(socket, "gameState", getGameState());
    // emitToSocket(socket, "timeLeft", getTimeLeft());
    if (getGameState() === GAME_STATE.MidGame) {
      emitToSocket(socket, "waitingTime", getWaitingTime());
    }

    emitToSocket(socket, "wonMessage", getWhoWon());

    const newPlayerId = getNextPlayerId();
    playerIdMap[socket.id] = newPlayerId;
    const player = createPlayer(newPlayerId);
    playerSocketMap[socket.id] = player;
    socketMap[socket.id] = socket;

    emitToSocket(socket, "id", newPlayerId);
    emitToSocket(socket, "p", getPlayers());

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      ipSet.delete(ipAddress);
      const playerId = playerIdMap[socket.id];
      delete playerSocketMap[socket.id];
      delete playerIdMap[socket.id];
      removePlayer(playerId);

      if (player.isZombie) removeZombie(player.name);
      io.emit("playerLeft", playerId);
    });

    socket.on("jump", () => {
      const controlMap = getControlsForPlayer(playerIdMap[socket.id]);
      controlMap[CONTROLS.JUMP] = true;
    });

    socket.on("use", () => {
      const controlMap = getControlsForPlayer(playerIdMap[socket.id]);
      controlMap[CONTROLS.USE] = true;
    });

    socket.on("c", (controls: number) => {
      const LEFT_BIT = 1 << 0;
      const RIGHT_BIT = 1 << 1;
      const newControls = {
        left: controls & LEFT_BIT,
        right: controls & RIGHT_BIT,
      };
      Object.assign(getControlsForPlayer(playerIdMap[socket.id]), newControls);
    });

    socket.on("ping", (dateMs) => {
      emitToSocket(socket, "pong", dateMs);
    });
  });
};
