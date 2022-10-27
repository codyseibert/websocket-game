import { PING_REQUEST_INTERVAL, TICK_RATE } from "../../src/constants";
import { ctx, setupCanvas } from "./canvas";
import { defaultKeymap, setKeymap } from "./controls";
import { drawBats, updateBats } from "./bat";
import { drawPlayers, interpolatePlayers, updatePlayers } from "./player";
import { drawBackground, drawTiles } from "./map";
import { getCamera } from "./camera";
import { drawHud } from "./hud";
import { emitRequestPingTime } from "./socket";
import { INTERPOLATE_RATE } from "./constants";

const width = window.innerWidth;
const height = window.innerHeight;
setupCanvas(width, height);

let lastRender = 0;
let pingDelay = 0;

function update(delta: number) {
  if (pingDelay >= PING_REQUEST_INTERVAL) {
    emitRequestPingTime();
    pingDelay = 0;
  }

  updateBats(delta);
  updatePlayers(delta);

  pingDelay += delta;
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  const camera = getCamera();
  drawBackground(ctx, camera);
  drawBats(ctx, camera);
  drawTiles(ctx, camera);
  drawPlayers(ctx, camera);
  drawHud(ctx);
}
function loop(timestamp) {
  const delta = timestamp - lastRender;
  update(delta);
  draw();
  lastRender = timestamp;
  window.requestAnimationFrame(loop);
}

function startup() {
  setKeymap(defaultKeymap);
  window.requestAnimationFrame(loop);
}

let lastInterpolate = performance.now();

setInterval(() => {
  const now = performance.now();
  const delta = now - lastInterpolate;
  interpolate(delta);
  lastInterpolate = now;
}, 1000 / INTERPOLATE_RATE);

function interpolate(delta: number) {
  interpolatePlayers(delta);
}

startup();
