import playerRUrl from "../images/playerR.png";
import playerLUrl from "../images/playerL.png";
import playerR_2Url from "../images/playerR_2.png";
import playerL_2Url from "../images/playerL_2.png";
import playerR_1Url from "../images/playerR_1.png";
import playerL_1Url from "../images/playerL_1.png";
import bgUrl from "../images/bg.png";
import zombieRUrl from "../images/zombieR.png";
import zombieLUrl from "../images/zombieL.png";
import arrowUrl from "../images/arrow.png";

import { drawImage, getCanvasSize } from "./canvas";
import { DRAW_HITBOX, PLAYER_HEIGHT, PLAYER_WIDTH } from "./constants";
import { getMyPlayerId } from "./socket";
import { Camera } from "./camera";
import { TICK_RATE } from "../../src/constants";
import { EDictionary } from "../../src/EDictionary";

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
const arrow = new Image();
arrow.src = arrowUrl;

let players: EDictionary<number, TPlayer> = new EDictionary()

type TInterpolation = {
  x: number;
  y: number;
  t: number;
};

const interpolations: Record<number, TInterpolation> = {};

export function removePlayer(playerId: number) {
  players.delete(playerId);
}

export function clearPlayers() {
  players.clear();
}

export function getInterpolations() {
  return interpolations;
}

const drawPlayerFactory =
  (ctx: CanvasRenderingContext2D, player: TPlayer, camera: Camera) =>
  (leftImage, rightImage) => {
    ctx.drawImage(
      player.facingRight ? rightImage : leftImage,
      0,
      0,
      PLAYER_WIDTH,
      PLAYER_HEIGHT,
      player.x - camera.cx,
      player.y - camera.cy,
      PLAYER_WIDTH,
      PLAYER_HEIGHT
    );
  };

function drawArrows(player: TPlayer, camera: Camera) {
  const myPlayer = getMyPlayer();
  if (!myPlayer) return;
  if (!myPlayer.isZombie) return;
  if (player.id !== getMyPlayerId()) return;

  let humans = players.getList().filter((player) => !player.isZombie);

  const canvasSize = getCanvasSize();

  for (let human of humans) {
    let deltaX = human.x - myPlayer.x;
    let deltaY = human.y - myPlayer.y;

    if (
      Math.abs(deltaX) < canvasSize.width / 3 &&
      Math.abs(deltaY) < canvasSize.height / 3
    )
      continue;

    let deg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    drawImage(
      arrow,
      player.x - camera.cx + PLAYER_WIDTH / 2,
      player.y - camera.cy + PLAYER_HEIGHT / 2,
      deg
    );
  }
}

export function drawPlayers(ctx: CanvasRenderingContext2D, camera: Camera) {
  const playerList = players.getList();
  for (let i = 0; i < playerList.length; i++) {

    const player = playerList[i];
    const drawPlayer = drawPlayerFactory(ctx, player, camera);

    if (DRAW_HITBOX) {
      ctx.fillRect(
        interpolations[player.id].x - camera.cx,
        interpolations[player.id].y - camera.cy,
        PLAYER_WIDTH,
        PLAYER_HEIGHT
      );
    }

    drawArrows(player, camera);

    if (player.isZombie) {
      drawPlayer(zombieImageL, zombieImageR);
    } else {
      switch (player.health) {
        case 3:
          drawPlayer(playerImageL, playerImageR);
          break;
        case 2:
          drawPlayer(playerImageL_2, playerImageR_2);
          break;
        case 1:
          drawPlayer(playerImageL_1, playerImageR_1);
          break;
      }
    }

    ctx.fillStyle = player.isZombie ? "#00FF00" : "#0000ff";
    ctx.font = `16px Verdana`;
    ctx.textAlign = "center";
    ctx.fillText(
      player.name,
      player.x + 15 - camera.cx,
      player.y - 10 - camera.cy
    );
  }
}

export function updatePlayers(delta: number) {
  const playerList = players.getList()
  for (let i = 0; i < playerList.length; i++) {
    const player = playerList[i]
    const target = interpolations[player.id];
    if (!target) continue;
    const t = Math.min(1, target.t / (1000 / TICK_RATE));
    player.x = player.x * (1 - t) + t * target.x;
    player.y = player.y * (1 - t) + t * target.y;
    target.t += delta;
  }
}

export function refreshPlayersState(playerStateChanges: TPlayer[]) {
  // someone new joined
  for (const player of playerStateChanges) {
    if (!players.has(player.id)) {
      players.set(player.id, player);
      interpolations[player.id] = {
        x: player.x ?? 0,
        y: player.y ?? 0,
        t: 0,
      };
    }
  }

  // sync players with server state
  for (const player of playerStateChanges) {
    const matchingPlayer = players.get(player.id)
    if (!matchingPlayer) continue;
    const { id, x, y, ...props } = player;
    Object.assign(matchingPlayer, props);
    if (y) interpolations[player.id].y = y;
    if (x) interpolations[player.id].x = x;
    interpolations[player.id].t = 0;
  }
}

export function getMyPlayer() {
  // here EDictionary expects a number, this is quick fix (as number) but please fix here
  return players.get(getMyPlayerId() as number);
}

export function getPlayers() {
  return players.getList();
}
