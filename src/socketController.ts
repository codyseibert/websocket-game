import {
  createPlayer,
  GAME_STATE,
  getGameState,
  removePlayer,
  getWaitingTime,
  getWhoWon,
} from "./gameController";
import { getGameMap } from "./mapController";
import { Server, Socket } from "socket.io";
import { CONTROLS, LIMIT_IP, MOCK_PING_DELAY, TControlMap } from "./constants";

let io;
const controlsMap: Record<string, TControlMap> = {};
const playerSocketMap = {};
const ipSet = new Set<string>();
const socketMap = {};
const actionQueue: Record<string, CONTROLS[]> = ({} = {});

function emitToSocket(channel, eventName, value) {
  if (MOCK_PING_DELAY) {
    setTimeout(() => {
      channel.emit(eventName, value);
    }, MOCK_PING_DELAY);
  } else {
    channel.emit(eventName, value);
  }
}

export const getControlsForPlayer = (playerId: string) => {
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

export const emitPlayers = (players: any) => {
  emitToSocket(io, "players", players);
};

export const emitGameState = (gameState: GAME_STATE) => {
  emitToSocket(io, "gameState", gameState);
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

function pushAction(playerId: string, action: CONTROLS) {
  if (!actionQueue[playerId]) {
    actionQueue[playerId] = [];
  }
  actionQueue[playerId].push(action);
}

export function getActionsForPlayer(playerId: string) {
  return actionQueue[playerId];
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

    emitToSocket(socket, "map", getGameMap());
    emitToSocket(socket, "gameState", getGameState());
    // emitToSocket(socket, "timeLeft", getTimeLeft());
    if (getGameState() === GAME_STATE.MidGame) {
      emitToSocket(socket, "waitingTime", getWaitingTime());
    }
    emitToSocket(socket, "wonMessage", getWhoWon());

    const player = createPlayer(socket.id);
    playerSocketMap[socket.id] = player;
    socketMap[socket.id] = socket;

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      ipSet.delete(ipAddress);
      delete playerSocketMap[socket.id];
      removePlayer(socket.id);
    });

    socket.on("jump", () => {
      const controlMap = getControlsForPlayer(socket.id);
      controlMap[CONTROLS.JUMP] = true;
    });

    socket.on("use", () => {
      const controlMap = getControlsForPlayer(socket.id);
      controlMap[CONTROLS.USE] = true;
    });

    socket.on("right", (value: boolean) => {
      const controlMap = getControlsForPlayer(socket.id);
      controlMap[CONTROLS.RIGHT] = value;
      pushAction(socket.id, CONTROLS.RIGHT);
    });

    socket.on("left", (value: boolean) => {
      const controlMap = getControlsForPlayer(socket.id);
      controlMap[CONTROLS.LEFT] = value;
    });

    socket.on("controls", (controls: TControlMap) => {
      Object.assign(getControlsForPlayer(socket.id), controls);
    });

    socket.on("ping", (dateMs) => {
      emitToSocket(socket, "pong", dateMs);
    });
  });
};
