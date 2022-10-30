import { PING_REQUEST_INTERVAL, TICK_RATE } from "../../src/constants";
import { ctx, setupCanvas } from "./canvas";
import { activeControls, defaultKeymap, setKeymap } from "./controls";
import { drawBats, updateBats } from "./bat";
import { drawPlayers, updatePlayers } from "./player";
import { drawBackground, drawTiles } from "./map";
import { getCamera } from "./camera";
import { drawHud } from "./hud";
import { emitControls, emitRequestPingTime } from "./socket";
import { INTERPOLATION_RATE } from "./constants";
import { drawMinimap } from "./minimap";

const width = window.innerWidth;
const height = window.innerHeight;
setupCanvas(width, height);

let lastRender = 0;

function update(delta: number) {
  updateBats(delta);
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  const camera = getCamera();
  drawBackground(ctx, camera);
  drawBats(ctx, camera);
  drawTiles(ctx, camera);
  drawPlayers(ctx, camera);
  drawHud(ctx);
  drawMinimap(ctx);
}

function sendInputs() {
  emitControls(activeControls);
}

function loop(timestamp) {
  const delta = timestamp - lastRender;
  update(delta);
  draw();
  lastRender = timestamp;
  window.requestAnimationFrame(loop);
}

setInterval(() => {
  sendInputs();
}, 1000 / TICK_RATE);

function startup() {
  setKeymap(defaultKeymap);
  window.requestAnimationFrame(loop);
}

let lastInterpolationTime = performance.now();
setInterval(() => {
  const now = performance.now();
  const delta = now - lastInterpolationTime;
  updatePlayers(delta);
  lastInterpolationTime = now;
}, 1000 / INTERPOLATION_RATE);

setInterval(() => {
  emitRequestPingTime();
}, 1000);

startup();
