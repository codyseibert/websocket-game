import playerRUrl from "../images/playerR.png";
import zombieRUrl from "../images/zombieR.png";
import playerLUrl from "../images/playerL.png";
import zombieLUrl from "../images/zombieL.png";
import { INTERPOLATION_SPEED, PLAYER_HEIGHT, PLAYER_WIDTH } from "./constants";
import { getMyPlayerId } from "./socket";

let players: TPlayer[] = [];

const playerImageR = new Image();
playerImageR.src = playerRUrl;
const zombieImageR = new Image();
zombieImageR.src = zombieRUrl;
const playerImageL = new Image();
playerImageL.src = playerLUrl;
const zombieImageL = new Image();
zombieImageL.src = zombieLUrl;

const interpolations = {};

export function getInterpolations() {
  return interpolations;
}

function drawPlayer(
  player: TPlayer,
  facingLeftImage,
  facingRightImage,
  px,
  py,
  cx,
  cy,
  ctx: CanvasRenderingContext2D
) {
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

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number
) {
  for (let player of players) {
    let { x: px, y: py } = interpolations[player.id];

    if (player.isZombie) {
      drawPlayer(player, zombieImageL, zombieImageR, px, py, cx, cy, ctx);
    } else {
      drawPlayer(player, playerImageL, playerImageR, px, py, cx, cy, ctx);
    }

    ctx.fillStyle = player.isZombie ? "#00FF00" : "#0000ff";
    ctx.font = `16px Verdana`;
    ctx.fillText(player.name, px - 10 - cx, py - 10 - cy);
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
