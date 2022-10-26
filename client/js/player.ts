import playerRUrl from "../images/playerR.png";
import playerLUrl from "../images/playerL.png";
import playerR_2Url from "../images/playerR_2.png";
import playerL_2Url from "../images/playerL_2.png";
import playerR_1Url from "../images/playerR_1.png";
import playerL_1Url from "../images/playerL_1.png";
import bgUrl from "../images/bg.png";
import zombieRUrl from "../images/zombieR.png";
import zombieLUrl from "../images/zombieL.png";

import { INTERPOLATION_SPEED, PLAYER_HEIGHT, PLAYER_WIDTH } from "./constants";
import { getMyPlayerId } from "./socket";
import { Camera } from "./camera";

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

let players: TPlayer[] = [];

const interpolations = {};

export function getInterpolations() {
  return interpolations;
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: TPlayer,
  facingLeftImage,
  facingRightImage,
  px: number,
  py: number,
  camera: Camera
) {
  ctx.drawImage(
    player.facingRight ? facingRightImage : facingLeftImage,
    0,
    0,
    PLAYER_WIDTH,
    PLAYER_HEIGHT,
    px - camera.cx,
    py - camera.cy,
    PLAYER_WIDTH,
    PLAYER_HEIGHT
  );
}

export function drawPlayers(ctx: CanvasRenderingContext2D, camera: Camera) {
  for (let player of players) {
    let { x: px, y: py } = interpolations[player.id];

    if (player.isZombie) {
      drawPlayer(ctx, player, zombieImageL, zombieImageR, px, py, camera);
    } else {
      switch (player.health) {
        case 3:
          drawPlayer(ctx, player, playerImageL, playerImageR, px, py, camera);
          break;
        case 2:
          drawPlayer(
            ctx,
            player,
            playerImageL_2,
            playerImageR_2,
            px,
            py,
            camera
          );
          break;
        case 1:
          drawPlayer(
            ctx,
            player,
            playerImageL_1,
            playerImageR_1,
            px,
            py,
            camera
          );
          break;
      }
    }

    ctx.fillStyle = player.isZombie ? "#00FF00" : "#0000ff";
    ctx.font = `16px Verdana`;
    ctx.fillText(player.name, px - 10 - camera.cx, py - 10 - camera.cy);
  }
}

export function updatePlayers(delta: number) {
  for (let player of players) {
    const interpolation = interpolations[player.id];
    interpolation.x =
      interpolation.x * (1 - interpolation.t) + interpolation.t * player.x;
    interpolation.y =
      interpolation.y * (1 - interpolation.t) + interpolation.t * player.y;
    interpolation.t = Math.min(interpolation.t + interpolation.speed, 1);
  }
}

export function setPlayers(newPlayers: TPlayer[]) {
  players = newPlayers;
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
}

export function getMyPlayer() {
  return players.find((player) => player.id === getMyPlayerId());
}

export function getPlayers() {
  return players;
}
