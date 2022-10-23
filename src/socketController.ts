import {
  createPlayer,
  GAME_STATE,
  getGameState,
  removePlayer,
} from "./gameController";
import { getMap, getGameMap } from "./mapController";
import { Server, Socket } from "socket.io";
import { LIMIT_IP } from "./constants";

let io;
const controlsMap = {};
const playerSocketMap = {};
const ipSet = new Set<string>();
const socketMap = {};

export const getControlsForPlayer = (playerId: string) => {
  return controlsMap[playerId];
};

export const emitPlayers = (players: any) => {
  io.emit("players", players);
};

export const emitGameState = (gameState: GAME_STATE) => {
  io.emit("gameState", gameState);
};

export const emitGameTimes = (startTime: number, gameLength) => {
  io.emit("gameTimes", { startTime, gameLength });
};

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

    socket.emit("map", { map: getMap(), gameMap: getGameMap() });
    socket.emit("gameState", getGameState());

    const player = createPlayer(socket.id);
    playerSocketMap[socket.id] = player;
    socketMap[socket.id] = socket;

    socket.on("disconnect", () => {
      console.log("a user disconnected");
      ipSet.delete(ipAddress);
      delete playerSocketMap[socket.id];
      removePlayer(socket.id);
    });

    socket.on("controls", (controls) => {
      controlsMap[socket.id] = controls;
    });
  });
};
