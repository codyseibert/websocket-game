import { PING_REQUEST_INTERVAL } from "../../src/constants";
import { ctx, setupCanvas } from "./canvas";
import { activeControls, defaultKeymap, setKeymap } from "./controls";
import { drawBats, updateBats } from "./bat";
import { drawPlayers, updatePlayers } from "./player";
import { drawBackground, drawTiles } from "./map";
import { getCamera } from "./camera";
import { drawHud } from "./hud";
import { emitControls, emitRequestPingTime } from "./socket";

const width = window.innerWidth;
const height = window.innerHeight;
setupCanvas(width, height);

let lastRender = 0;
let pingDelay = 0;

function update(delta: number) {
  emitControls(activeControls);

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

startup();
