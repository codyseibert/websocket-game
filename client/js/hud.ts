import { getCanvasSize } from "./canvas";
import { getGameState } from "./game";
import { getPlayers } from "./player";
import { getZombieKills } from "./socket";
import { getHumansSurvived } from "./socket";

import zombieUrl from "../images/zombieR.png";
import humanUrl from "../images/playerR.png";

import headUrl from "../images/head.png";

const humanImage = new Image();
const zombieImage = new Image();

humanImage.src = humanUrl;
zombieImage.src = zombieUrl;

let humansSurvived: string[] = [];

let zombieKills: { name: string, kills: number }[] = [];

const headImage = new Image();

headImage.src = headUrl;

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

function lineWrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, x: number, y: number, lineHeight: number) {
  let words = text.split(" ");
  let lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
      let word = words[i];
      let width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y + i * lineHeight);
  }
}

export function drawHud(ctx: CanvasRenderingContext2D) {
  const currentGameState = getGameState();

  const { width, height } = getCanvasSize();

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

  const hudOffsetX = 20;

  if (currentGameState === "PLAYING") {
    ctx.fillText(`Time left: ${new Date(timeLeft * 1000).toISOString().substring(14, 19)}`, hudOffsetX, 50);
    ctx.drawImage(humanImage, hudOffsetX, 75, 20, 30);
    ctx.fillText(` : ${humansRemaining}`, hudOffsetX + 10, 100);
    ctx.drawImage(zombieImage, hudOffsetX, 110, 20, 30);
    ctx.fillText(` : ${totalZombies}`, hudOffsetX + 10, 135);
  } else if (currentGameState === "WAITING_FOR_PLAYERS") {
    let msg = "";
    if (wonMessage) msg += `${wonMessage.toLowerCase().charAt(0).toUpperCase() + wonMessage.toLowerCase().slice(1)} won!`;
    msg += " waiting for players...";
    ctx.fillText(msg, hudOffsetX, 50);
  } else if (currentGameState === "MIDGAME") {
    ctx.fillText(`${waitingTime}s left.`, hudOffsetX, 50);

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#000000";
    ctx.fillRect(width / 4, height / 6, width / 2, height / 1.5);
    ctx.globalAlpha = 1;
    
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "30px Verdana";
    if (wonMessage === "ZOMBIES") ctx.fillStyle = "#00FF00";
    ctx.fillText(`${wonMessage.toLowerCase().charAt(0).toUpperCase() + wonMessage.toLowerCase().slice(1)} won!`, width / 2, height / 6 + 55);
    ctx.textAlign = "left";
    ctx.font = "24px Verdana";
    ctx.fillStyle = "#FFFFFF";

    ctx.drawImage(humanImage, width / 4 + 30, height / 6 + height / 1.5 / 2 + 40, 24, 36);
    ctx.drawImage(zombieImage, width / 4 + 30, height / 6 + 76, 24, 36);

    zombieKills = getZombieKills();
    humansSurvived = getHumansSurvived();

    zombieKills.sort((a, b) => {
      return b.kills - a.kills;
    })

    let finalKills: string[] = [];

    for (const zombie of zombieKills) {
      finalKills.push(`${zombie.name}: ${zombie.kills}`);
    }

    lineWrap(ctx, `kills (${finalKills.length}): ${finalKills.join(", ")}`, width / 2 - 100, width / 4 + 65, height / 6 + 102, 35);

    lineWrap(ctx, `survived (${humansSurvived.length}): ${humansSurvived.join(", ")}`, width / 2 - 100, width / 4 + 65, height / 6 + height / 1.5 / 2 + 64, 35);
  }

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
    // fillMixedText(ctx, [{ text: deathEvent.zombieName, fillStyle: "#00FF00"}, { text: " infected ", fillStyle: "#FF00FF"}, { text: deathEvent.playerName, fillStyle: "#FFFFFF"}], width - 220, i * -20 + height - 20)
    
    ctx.textAlign = "right";

    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`${deathEvent.playerName}`, width - 20, i * -20 + height - 20);

    ctx.drawImage(headImage, width - ctx.measureText(`${deathEvent.playerName}`).width - 50, i * -20 + height - 37, 23, 23);

    ctx.fillStyle = "#00FF00";
    ctx.fillText(`${deathEvent.zombieName}`, width - ctx.measureText(`${deathEvent.playerName}`).width - 60, i * -20 + height - 20);
  }
}