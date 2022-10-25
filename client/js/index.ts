import { io } from "socket.io-client";
import tilesheetUrl from "../images/tilesheet.png";
import decalsUrl from "../images/decals.png";
import playerRUrl from "../images/playerR.png";
import playerLUrl from "../images/playerL.png";
import playerR_2Url from "../images/playerR_2.png";
import playerL_2Url from "../images/playerL_2.png";
import playerR_1Url from "../images/playerR_1.png";
import playerL_1Url from "../images/playerL_1.png";
import zombieRUrl from "../images/zombieR.png";
import zombieLUrl from "../images/zombieL.png";
import bgUrl from "../images/bg.png";
import { PING_REQUEST_INTERVAL } from "../../src/constants";
import {INTERPOLATION_SPEED, PLAYER_HEIGHT, PLAYER_WIDTH, TILE_SIZE} from "./constants";
import {ctx, setupCanvas} from "./canvas";
import {activeControls, defaultKeymap, setKeymap} from "./controls";
import { createBat, drawBat, TBat, updateBat } from "./bat";

const socket = io(process.env.WS_SERVER ?? "ws://localhost:3000");
const width = window.innerWidth;
const height = window.innerHeight;
setupCanvas(width, height);

let lastRender = 0;
ctx.fillStyle = "red";

let map: TGameMap | null = null;
let players: TPlayer[] = [];
let bats: TBat[] = [];
const interpolations = {};

let gameState;
let timeLeft = 0;
let waitingTime = 0;
let pingTimeMS = -1;
let pingDelay = 0;

let wonMessage = "";

const bgImage = new Image();
bgImage.src = bgUrl;
const playerImageR = new Image();
playerImageR.src = playerRUrl;
const playerImageL = new Image();
playerImageL.src = playerLUrl;
const playerImageR_2 = new Image();
playerImageR_2.src = playerR_2Url;
const playerImageL_2 = new Image();
playerImageL_2.src = playerL_2Url;
const playerImageR_1 = new Image();
playerImageR_1.src = playerR_1Url;
const playerImageL_1 = new Image();
playerImageL_1.src = playerL_1Url;
const zombieImageR = new Image();
zombieImageR.src = zombieRUrl;
const zombieImageL = new Image();
zombieImageL.src = zombieLUrl;
const mapImage = new Image();
mapImage.src = tilesheetUrl;
const decalImage = new Image();
decalImage.src = decalsUrl;

socket.on("map", (serverMap: TGameMap) => {
  map = serverMap;
});

socket.on("gameState", (serverGameState) => {
  gameState = serverGameState;
});

socket.on("timeLeft", (time) => {
  timeLeft = time;
});

socket.on("waitingTime", (time) => {
  waitingTime = time;
});

socket.on("wonMessage", (message: string) => {
  wonMessage = message;
});

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

socket.on("ping", (ping: number) => {
  pingTimeMS = ping;
});

function update(delta: number) {
  socket.emit("controls", activeControls);
  
  if (pingDelay >= PING_REQUEST_INTERVAL) {
    socket.emit("requestPingTime", Date.now());
    pingDelay = 0;
  }

  bats.forEach((bat) => updateBat(bat, delta));

  for (let player of players) {
    const interpolation = interpolations[player.id];
    interpolation.x =
      interpolation.x * (1 - interpolation.t) + interpolation.t * player.x;
    interpolation.y =
      interpolation.y * (1 - interpolation.t) + interpolation.t * player.y;
    interpolation.t = Math.min(interpolation.t + interpolation.speed, 1);
  }
  pingDelay += delta;
}

function getTileImageLocation(id: number, metadata: any) {
  if (!map) return { x: 0, y: 0 };
  const cols = metadata.width / TILE_SIZE;
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
    cx = interpolations[playerToFocus.id].x - width / 2;
    cy = interpolations[playerToFocus.id].y - height / 2;
  }

  // background
  ctx.drawImage(
    bgImage,
    0,
    0,
    bgImage.width,
    bgImage.height,
    0 - cx / 20 - 50,
    0 - cy / 20 - 50,
    bgImage.width,
    bgImage.height
  );

  bats.forEach((bat) => drawBat(bat, ctx, cx, cy));

  ctx.fillStyle = "#000000";

  function drawTile(tileType, toDraw, col: number, row: number) {
    if (tileType !== 0) {
      const {x, y} = getTileImageLocation(tileType, map!!.grid.metadata);
      ctx.drawImage(
        toDraw,
        x,
        y,
        TILE_SIZE,
        TILE_SIZE,
        Math.floor(col * TILE_SIZE - cx),
        Math.floor(row * TILE_SIZE - cy),
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }

  if (map) {
    for (let row = 0; row < map.grid.tiles.length; row++) {
      for (let col = 0; col < map.grid.tiles[row].length; col++) {
        drawTile(map.grid.tiles[row][col], mapImage, col, row);
      }
    }

    for (let row = 0; row < map.decals.tiles.length; row++) {
      for (let col = 0; col < map.decals.tiles[row].length; col++) {
        const tileType = map.decals.tiles[row][col];

        if (tileType !== 0) {
          const { x, y } = getTileImageLocation(tileType, map.decals.metadata);
          ctx.drawImage(
            decalImage,
            x,
            y,
            TILE_SIZE,
            TILE_SIZE,
            Math.floor(col * TILE_SIZE - cx),
            Math.floor(row * TILE_SIZE - cy),
            TILE_SIZE,
            TILE_SIZE
          );

          if (tileType === 32) {
            ctx.fillStyle = "#ffffff";
            ctx.font = `16px Verdana`;
            ctx.fillText(
              "Teleport (e)",
              Math.floor(col * TILE_SIZE - cx + 20),
              Math.floor(row * TILE_SIZE - cy)
            );
          }
        }
      }
    }
  }

  function drawPlayer(player: TPlayer, facingLeftImage, facingRightImage, px, py) {
    ctx.drawImage(
      player.facingRight ? facingRightImage : facingLeftImage,
      0,
      0,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      px - cx,
      py - cy,
      PLAYER_WIDTH,
      PLAYER_HEIGHT
    );
  }

  for (let player of players) {
    let { x: px, y: py } = interpolations[player.id];

    if (player.isZombie) {
      drawPlayer(player, zombieImageL, zombieImageR, px, py);
    } else {
      switch (player.health) {
        case 3:
          drawPlayer(player, playerImageL, playerImageR, px, py);
          break;
        case 2:
          drawPlayer(player, playerImageL_2, playerImageR_2, px, py);
          break;
        case 1:
          drawPlayer(player, playerImageL_1, playerImageR_1, px, py);
          break;
      }
    }

    // ctx.fillRect(px - cx, py - cy, PLAYER_WIDTH, PLAYER_HEIGHT);
    ctx.fillStyle = player.isZombie ? "#00FF00" : "#0000ff";
    ctx.font = `16px Verdana`;
    ctx.fillText(player.name, px - 10 - cx, py - 10 - cy);
  }

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `24px Verdana`;
  if (gameState === "PLAYING") {
    ctx.fillText(`Time left: ${timeLeft}`, 50, 50);
  } else if (gameState === "WAITING_FOR_PLAYERS") {
    let msg = "";
    if (wonMessage) msg += wonMessage + " won! ";
    msg += "waiting for players";
    ctx.fillText(msg, 50, 50);
  } else if (gameState === "MIDGAME") {
    let msg = "";
    if (wonMessage) msg += wonMessage + " won! ";
    msg += `${waitingTime}s left.`;
    ctx.fillText(msg, 50, 50);
  }
  ctx.fillText(`Ping: ${pingTimeMS !== -1 ? pingTimeMS + "ms" : "-"}`, 50, 75);
}

function loop(timestamp) {
  const delta = timestamp - lastRender;

  update(delta);
  draw();

  lastRender = timestamp;
  window.requestAnimationFrame(loop);
}

function startup() {
  setKeymap(defaultKeymap)
  window.requestAnimationFrame(loop);
  
  setInterval(() => {
    if (!document.hasFocus()) return;

    bats.push(
      createBat(5000, (bat) => {
        bats = bats.filter((b) => b !== bat);
      })
    );
  }, 500);
}

startup()

