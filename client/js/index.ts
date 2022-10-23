import { io } from "socket.io-client";
import { GAME_STATE } from "../../src/gameController";
import tilesheetUrl from "../images/tilesheet.png";

const socket = io("ws://localhost:3000");
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const width = window.innerWidth;
const height = window.innerHeight;
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
let lastRender = 0;
ctx.fillStyle = "red";

const TILE_SIZE = 128;
const INTERPOLATION_SPEED = 0.05;
const PLAYER_SIZE = 16;

let map = [[]];
let gameMap: TGameMap | null = null;
let players: TPlayer[] = [];
const interpolations = {};

const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
};

const keyMap = {
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  " ": "jump",
};

let gameState;
let timeLeft = 0;
let waitingTime = 0;

let wonMessage = '';

const mapImage = new Image();

socket.on("map", ({ map: serverMap, gameMap: serverGameMap }) => {
  map = serverMap;
  gameMap = serverGameMap;
  mapImage.src = tilesheetUrl;
});

socket.on("gameState", (serverGameState) => {
  gameState = serverGameState;
});

socket.on("timeLeft", (time) => {
    timeLeft = time;
  }
);

socket.on("waitingTime", (time) => {
  waitingTime = time;
}
);

socket.on("wonMessage", (message: string) => {
  wonMessage = message;
})

socket.on("players", (serverPlayers) => {
  players = serverPlayers;
  for (const player of players) {
    if (!interpolations[player.id]) {
      interpolations[player.id] = {
        t: 0,
        x: player.x,
        y: player.y,
        speed: INTERPOLATION_SPEED,
      };
    }
    interpolations[player.id].t = 0;
    const dx = (player.x - interpolations[player.id].x) ** 2;
    const dy = (player.y - interpolations[player.id].y) ** 2;
    if (Math.sqrt(dx + dy) > 5) {
      interpolations[player.id].t = 0.5;
    }
  }
});

document.addEventListener("keydown", (e) => {
  controls[keyMap[e.key]] = true;
});

document.addEventListener("keyup", (e) => {
  controls[keyMap[e.key]] = false;
});

function update(delta: number) {
  socket.emit("controls", controls);

  for (let player of players) {
    const interpolation = interpolations[player.id];
    interpolation.x =
      interpolation.x * (1 - interpolation.t) + interpolation.t * player.x;
    interpolation.y =
      interpolation.y * (1 - interpolation.t) + interpolation.t * player.y;
    interpolation.t = Math.min(interpolation.t + interpolation.speed, 1);
  }
}

function getTileImageLocation(id: number) {
  if (!gameMap || !gameMap.tileset) return { x: 0, y: 0 };
  const cols = gameMap.tileset.width / TILE_SIZE;
  const x = ((id - 1) % cols) * TILE_SIZE;
  const y = Math.floor((id - 1) / cols) * TILE_SIZE;
  return {
    x,
    y,
  };
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  let cx = 0;
  let cy = 0;

  const playerToFocus = players.find((player) => player.id === socket.id);
  if (playerToFocus) {
    cx = interpolations[playerToFocus.id].x - canvas.width / 2;
    cy = interpolations[playerToFocus.id].y - canvas.height / 2;
  }

  ctx.fillStyle = "#000000";
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const tileType = map[row][col];

      if (tileType !== 0) {
        const { x, y } = getTileImageLocation(tileType);
        ctx.drawImage(
          mapImage,
          x,
          y,
          TILE_SIZE,
          TILE_SIZE,
          col * TILE_SIZE - cx,
          row * TILE_SIZE - cy,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    }
  }

  for (let player of players) {
    const { x: px, y: py } = interpolations[player.id];

    if (player.id === socket.id) {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(px - 1 - cx, py - 1 - cy, PLAYER_SIZE + 2, PLAYER_SIZE + 2);
    }

    ctx.fillStyle = player.color;
    ctx.fillRect(px - cx, py - cy, PLAYER_SIZE, PLAYER_SIZE);
    ctx.fillStyle = "#000000";
    ctx.font = `16px Verdana`;
    ctx.fillText(player.name, px - 10 - cx, py - 10 - cy);
  }

  ctx.fillStyle = "#000000";
  ctx.font = `24px Verdana`;
  if (gameState === "PLAYING") {
    ctx.fillText(`Time left: ${timeLeft}`, 50, 50);
  } else if (gameState === "WAITING_FOR_PLAYERS") {
    let msg = '';
    if (wonMessage) msg += wonMessage + ' won! ';
    msg += 'waiting for players';
    ctx.fillText(msg, 50, 50);
  } else if (gameState === "MIDGAME") {
    let msg = '';
    if (wonMessage) msg += wonMessage + ' won! ';
    msg += `${waitingTime}s left.`;
    ctx.fillText(msg, 50, 50);
  }
}

function loop(timestamp) {
  const delta = timestamp - lastRender;

  update(delta);
  draw();

  lastRender = timestamp;
  window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
