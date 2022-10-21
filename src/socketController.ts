import { createPlayer, removePlayer } from "./gameController";
import { getMap, getGameMap } from "./mapController";
import { server } from "./httpController";
import { Server, Socket } from "socket.io";
export const io = new Server(server);

const controlsMap = {};
const playerSocketMap = {};
const ipSet = new Set<string>();
const socketMap = {};

io.on("connect", (socket: Socket) => {
  console.log("a user connected");

  const ipAddress = (socket.handshake.headers["x-forwarded-for"] ??
    socket.handshake.headers["x-real-ip"] ??
    socket.handshake.address) as string;

  if (ipSet.has(ipAddress)) {
    socket.disconnect();
    return;
  }
  ipSet.add(ipAddress);

  socket.emit("map", { map: getMap(), gameMap: getGameMap() });

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

export const getControlsForPlayer = (playerId: string) => {
  return controlsMap[playerId];
};
