const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(express.static("public"));

const speed = 7;

const player = {
  top: 0,
  left: 0,
};

const food = {
  top: 100,
  left: 100,
};

const spawnFood = () => {
  food.left = parseInt(Math.random() * 300);
  food.top = parseInt(Math.random() * 300);
};
spawnFood();

const nextTick = () => {
  if (
    distanceBetween(food, { left: player.left + 5, top: player.top + 5 }) <= 7
  ) {
    spawnFood();
  }
  io.emit("food", food);
  io.emit("player", player);
};

const canClick = {};

const canUserClick = (socket) => {
  return canClick[socket.id];
};

const distanceBetween = (p1, p2) => {
  return Math.sqrt((p1.left - p2.left) ** 2 + (p1.top - p2.top) ** 2);
};

const timeoutUser = (socket) => {
  canClick[socket.id] = false;
  setTimeout(() => {
    canClick[socket.id] = true;
  }, 300);
};

io.on("connection", (socket) => {
  console.log("a user connected");
  canClick[socket.id] = true;

  socket.on("right", () => {
    if (!canUserClick(socket)) return;
    timeoutUser(socket);
    player.left += speed;
  });

  socket.on("left", () => {
    if (!canUserClick(socket)) return;
    timeoutUser(socket);
    player.left -= speed;
  });

  socket.on("up", () => {
    if (!canUserClick(socket)) return;
    timeoutUser(socket);
    player.top -= speed;
  });

  socket.on("down", () => {
    if (!canUserClick(socket)) return;
    timeoutUser(socket);
    player.top += speed;
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

setInterval(() => {
  nextTick();
}, 1000 / 60);
