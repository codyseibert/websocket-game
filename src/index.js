const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const random = require("random-name");

const GRAVITY = 0.0228;
const TICK_RATE = 40;
const TILE_SIZE = 32;
const COIN_SIZE = 6;
const PLAYER_SPEED = 5.0;
const END_GAME_SCORE = 10;
const COIN_SPAWN_RATE = 500;
const PLAYER_SIZE = 16;
const CONTROLS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
  JUMP: "jump",
};
const JUMP_SPEED = -12;

const map = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const collidables = [];
for (let row = 0; row < map.length; row++) {
  for (let col = 0; col < map[row].length; col++) {
    if (map[row][col] !== 0) {
      collidables.push({
        y: row * TILE_SIZE,
        x: col * TILE_SIZE,
      });
    }
  }
}

let coins = [];
let players = [];
const playerSocketMap = {};
const socketMap = {};
const controlsMap = {};
const ipMap = {};
const canJump = {};

app.use(express.static("public"));

const sendMap = (socket) => {
  socket.emit("map", map);
};

io.on("connect", (socket) => {
  console.log("a user connected");

  const ipAddress =
    socket.handshake.headers["x-forwarded-for"] ??
    socket.handshake.headers["x-real-ip"] ??
    socket.handshake.address;

  if (ipMap[ipAddress]) {
    socket.disconnect();
    return;
  }
  ipMap[ipAddress] = true;

  sendMap(socket);

  const player = {
    x: 100,
    y: 100,
    vx: 0,
    vy: 0,
    score: 0,
    name: random.first(),
    id: socket.id,
    color: `#${Math.floor(Math.random() * (0xffffff + 1)).toString(16)}`,
  };
  playerSocketMap[socket.id] = player;
  socketMap[socket.id] = socket;
  players.push(player);

  socket.on("disconnect", () => {
    console.log("a user disconnected");
    delete ipMap[ipAddress];
    delete playerSocketMap[socket.id];
    players = players.filter((player) => player.id !== socket.id);
  });

  socket.on("controls", (controls) => {
    controlsMap[socket.id] = controls;
  });
});

const isOverlap = (rect1, rect2) => {
  if (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.height + rect1.y > rect2.y
  ) {
    return true;
  } else {
    return false;
  }
};

const getBoundingBoxFactory = (STATIC_SIZE) => (entity) => {
  return {
    width: STATIC_SIZE,
    height: STATIC_SIZE,
    x: entity.x,
    y: entity.y,
  };
};

const getPlayerBoundingBox = getBoundingBoxFactory(PLAYER_SIZE);
const getTileBoundingBox = getBoundingBoxFactory(TILE_SIZE);
const getCoinBoundingBox = getBoundingBoxFactory(COIN_SIZE);

const isCollidingWithMap = (player) => {
  for (const collidable of collidables) {
    if (
      isOverlap(getPlayerBoundingBox(player), getTileBoundingBox(collidable))
    ) {
      return true;
    }
  }
  return false;
};

const spawnCoin = () => {
  const randomRow = Math.floor(Math.random() * map.length);
  const randomCol = Math.floor(Math.random() * map[0].length);
  if (map[randomRow][randomCol] !== 0) return;
  coins.push({
    x: randomCol * TILE_SIZE,
    y: randomRow * TILE_SIZE,
  });
};
setInterval(spawnCoin, COIN_SPAWN_RATE);

const resetGame = () => {
  for (const player of players) {
    player.score = 0;
    player.x = 100;
    player.y = 100;
    player.vx = 0;
    player.vy = 0;
  }
};

const tick = (delta) => {
  for (const player of players) {
    const playerControls = controlsMap[player.id] ?? {};

    for (let i = coins.length - 1; i >= 0; i--) {
      const coin = coins[i];
      if (isOverlap(getCoinBoundingBox(coin), getPlayerBoundingBox(player))) {
        player.score++;
        coins.splice(i, 1);
        socketMap[player.id].emit("playCoinSound");
        if (player.score > END_GAME_SCORE) {
          resetGame();
        }
      }
    }

    if (playerControls[CONTROLS.RIGHT]) {
      player.x += PLAYER_SPEED;

      if (isCollidingWithMap(player)) {
        player.x -= PLAYER_SPEED;
      }
    } else if (playerControls[CONTROLS.LEFT]) {
      player.x -= PLAYER_SPEED;

      if (isCollidingWithMap(player)) {
        player.x += PLAYER_SPEED;
      }
    }

    player.vy += GRAVITY * delta;
    player.y += player.vy;
    if (isCollidingWithMap(player)) {
      if (player.vy > 0) {
        canJump[player.id] = true;
      }
      player.y -= player.vy;
      player.vy = 0;
    }

    if (playerControls[CONTROLS.JUMP] && canJump[player.id]) {
      canJump[player.id] = false;
      player.vy = JUMP_SPEED;
    }

    if (player.y > map.length * TILE_SIZE * 2) {
      player.x = 100;
      player.y = 100;
      player.vy = 0;
    }
  }

  io.emit("players", players);
  io.emit("coins", coins);
};

let lastUpdate = Date.now();
setInterval(() => {
  const now = Date.now();
  tick(now - lastUpdate);
  lastUpdate = now;
}, 1000 / TICK_RATE);

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
