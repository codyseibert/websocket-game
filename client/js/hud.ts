import { getGameState } from "./game";

let timeLeft = "";
let wonMessage = "";
let waitingTime = 0;
let pingTimeMS = -1;

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

  if (currentGameState === "PLAYING") {
    ctx.fillText(`Time left: ${timeLeft}`, 50, 50);
  } else if (currentGameState === "WAITING_FOR_PLAYERS") {
    let msg = "";
    if (wonMessage) msg += wonMessage + " won! ";
    msg += "waiting for players";
    ctx.fillText(msg, 50, 50);
  } else if (currentGameState === "MIDGAME") {
    let msg = "";
    if (wonMessage) msg += wonMessage + " won! ";
    msg += `${waitingTime}s left.`;
    ctx.fillText(msg, 50, 50);
  }
  ctx.fillText(`Ping: ${pingTimeMS !== -1 ? pingTimeMS + "ms" : "-"}`, 50, 75);
}
