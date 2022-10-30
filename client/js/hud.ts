import { getCanvasSize } from "./canvas";
import { getGameState } from "./game";
import { getPlayers } from "./player";

import zombieUrl from "../images/zombieR.png";
import humanUrl from "../images/playerR.png";

const humanImage = new Image();
const zombieImage = new Image();

humanImage.src = humanUrl;
zombieImage.src = zombieUrl;

let timeLeft: number = 0;
let wonMessage = "";
let waitingTime = 0;
let pingTimeMS = -1;

const deathEvents: any[] = [];

export function trackDeath(deathEvent) {
  deathEvents.push(deathEvent);
  setTimeout(() => {
    const index = deathEvents.findIndex((event) => event === deathEvent);
    deathEvents.splice(index, 1);
  }, 5000);
}

export function setTimeLeft(newTimeLeft) {
  timeLeft = newTimeLeft;
}

export function setWonMessage(message: string) {
  wonMessage = message;
}

export function setWaitingTime(time: number) {
  waitingTime = time;
}

export function setPingTimeMs(time: number) {
  pingTimeMS = time;
}

export function drawHud(ctx: CanvasRenderingContext2D) {
  const currentGameState = getGameState();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `24px Verdana`;
  ctx.textAlign = "left";

  const players = getPlayers();
  const humansRemaining = players.reduce(
    (acc, player) => acc + (player.isZombie ? 0 : 1),
    0
  );
  const totalZombies = players.reduce(
    (acc, player) => acc + (player.isZombie ? 1 : 0),
    0
  );

  const fillMixedText = (ctx: CanvasRenderingContext2D, args: any, x: number, y: number) => {
    // ctx.textAlign = "right";
    ctx.save();
    args.forEach(({ text, fillStyle }) => {
      ctx.fillStyle = fillStyle;
      ctx.fillText(text, x, y);
      x += ctx.measureText(text).width;
    });
    ctx.restore();
  };
  

  const hudOffsetX = 20;

  if (currentGameState === "PLAYING") {
    ctx.fillText(`Time left: ${new Date(timeLeft * 1000).toISOString().substring(14, 19)}`, hudOffsetX, 50);
    ctx.drawImage(humanImage, hudOffsetX, 55, 20, 30);
    ctx.fillText(` : ${humansRemaining}`, hudOffsetX + 10, 80);
    ctx.drawImage(zombieImage, hudOffsetX, 85, 20, 30);
    ctx.fillText(` : ${totalZombies}`, hudOffsetX + 10, 110);
  } else if (currentGameState === "WAITING_FOR_PLAYERS") {
    let msg = "";
    if (wonMessage) msg += wonMessage + " won! ";
    msg += "waiting for players";
    ctx.fillText(msg, hudOffsetX, 50);
  } else if (currentGameState === "MIDGAME") {
    let msg = "";
    if (wonMessage) msg += wonMessage + " won! ";
    msg += `${waitingTime}s left.`;
    ctx.fillText(msg, hudOffsetX, 50);
  }

  const { width, height } = getCanvasSize();

  if (pingTimeMS > 100) {
    if (pingTimeMS > 150) {
      ctx.fillStyle = "#FF0000";
    } else {
      ctx.fillStyle = "#FFFF00";
    }
  } else {
    ctx.fillStyle = "#00FF00";
  }

  ctx.fillText(
    `${pingTimeMS !== -1 ? pingTimeMS + "ms" : "-"}`,
    20,
    height - 20
  );

  ctx.font = `16px Verdana`;
  for (let i = 0; i < deathEvents.length; i++) {
    const deathEvent = deathEvents[i];
    fillMixedText(ctx, [{ text: deathEvent.zombieName, fillStyle: "#00FF00"}, { text: " infected ", fillStyle: "#FF00FF"}, { text: deathEvent.playerName, fillStyle: "#FFFFFF"}], width - 220, i * -20 + height - 20)
    // ctx.fillText(
    //   `${deathEvent.zombieName} infected ${deathEvent.playerName}`,
    //   width - 10,
    //   i * 20 + 180
    // );
  }
}