import { getCanvasSize } from "./canvas";
import { getGameState } from "./game";
import { getPlayers } from "./player";

let timeLeft = "";
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

  const hudOffsetX = 20;

  if (currentGameState === "PLAYING") {
    ctx.fillText(`Time left: ${timeLeft}`, hudOffsetX, 50);
    ctx.fillText(`Humans Remaining: ${humansRemaining}`, hudOffsetX, 80);
    ctx.fillText(`Total Zombies: ${totalZombies}`, hudOffsetX, 110);
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
  ctx.fillText(
    `Ping: ${pingTimeMS !== -1 ? pingTimeMS + "ms" : "-"}`,
    20,
    height - 20
  );

  ctx.font = `16px Verdana`;
  ctx.textAlign = "right";
  for (let i = 0; i < deathEvents.length; i++) {
    const deathEvent = deathEvents[i];
    ctx.fillText(
      `${deathEvent.zombieName} ate ${deathEvent.playerName}`,
      width - 10,
      i * 20 + 180
    );
  }
}
