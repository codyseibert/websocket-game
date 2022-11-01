import { getCanvasSize } from "./canvas";
import { PLAYER_HEIGHT, PLAYER_WIDTH, TILE_SIZE } from "./constants";
import { getDecalMap, getTileMap, PORTAL_ID } from "./map";
import { getPlayers } from "./player";

const MINIMAP_OFFSET_Y = 10;
const MINIMAP_WIDTH = 200;

let MINIMAP_IMAGE: null | HTMLCanvasElement = null;

export function createMinimap() {
  const mmCanvas = document.createElement("canvas") as HTMLCanvasElement;
  const mmCtx = mmCanvas.getContext("2d") as CanvasRenderingContext2D;

  // the map will be ready at this point
  const tileMap = getTileMap() as number[][];
  const decalMap = getDecalMap() as number[][];


  const rows = tileMap.length;
  const cols = tileMap[0].length;
  const MINIMAP_HEIGHT = (MINIMAP_WIDTH * rows) / cols;
  const MINIMAP_RATIO_X = MINIMAP_WIDTH / (cols * TILE_SIZE);
  const MINIMAP_RATIO_Y = MINIMAP_HEIGHT / (rows * TILE_SIZE);
  const PADDING = 10;
  const offsetX = getCanvasSize().width - MINIMAP_WIDTH - PADDING;

  mmCanvas.width = MINIMAP_WIDTH + PADDING;
  mmCanvas.height = MINIMAP_HEIGHT + PADDING;

  mmCtx.fillStyle = "#000000";
  mmCtx.globalAlpha = 0.7;
  mmCtx.fillRect(
    0,
    0,
    mmCanvas.width,
    mmCanvas.height
  );
  mmCtx.globalAlpha = 1;


  for (let row = 0; row < tileMap.length; row++) {
    for (let col = 0; col < tileMap[row].length; col++) {
      const tile = tileMap[row][col];

      if (tile !== 0) {
        mmCtx.fillStyle = "#FF0000";
        mmCtx.fillRect(
          Math.floor(col * TILE_SIZE * MINIMAP_RATIO_X + PADDING / 2),
          Math.floor(row * TILE_SIZE * MINIMAP_RATIO_Y + PADDING / 2),
          Math.round(TILE_SIZE * MINIMAP_RATIO_X),
          Math.round(TILE_SIZE * MINIMAP_RATIO_Y * 0.65)
        );
      }
    }
  }

  for (let row = 0; row < decalMap.length; row++) {
    for (let col = 0; col < decalMap[row].length; col++) {
      const tile = decalMap[row][col];

      if (tile === PORTAL_ID) {
        mmCtx.fillStyle = "#7222FF";

        mmCtx.fillRect(
          Math.floor(col * TILE_SIZE * MINIMAP_RATIO_X + PADDING / 2),
          Math.floor(row * TILE_SIZE * MINIMAP_RATIO_Y + PADDING / 2),
          Math.ceil(TILE_SIZE * MINIMAP_RATIO_X),
          Math.ceil(TILE_SIZE * MINIMAP_RATIO_Y)
        );
      }
    }
  }

  MINIMAP_IMAGE = mmCanvas;
}

export function drawMinimap(ctx: CanvasRenderingContext2D) {
  const tileMap = getTileMap();
  const decalMap = getDecalMap();

  const { width } = getCanvasSize();

  if (!tileMap) return;
  if (!decalMap) return;
  if (!MINIMAP_IMAGE) return;

  const rows = tileMap.length;
  const cols = tileMap[0].length;
  const MINIMAP_HEIGHT = (MINIMAP_WIDTH * rows) / cols;
  const MINIMAP_RATIO_X = MINIMAP_WIDTH / (cols * TILE_SIZE);
  const MINIMAP_RATIO_Y = MINIMAP_HEIGHT / (rows * TILE_SIZE);

  const offsetX = width - MINIMAP_WIDTH - 10;

  ctx.drawImage(
    MINIMAP_IMAGE,
    offsetX - 5,
    MINIMAP_OFFSET_Y - 5,
    MINIMAP_IMAGE.width,
    MINIMAP_IMAGE.height
  )

  const players = getPlayers();
  for (let player of players) {
    ctx.fillStyle = player.isZombie ? "#00FF00" : "#FFFFFF";

    if (player.y < 2600 && player.x > -110 && player.x < 3900) ctx.fillRect(
      player.x * MINIMAP_RATIO_X + offsetX,
      Math.floor((player.y - 0.5 * PLAYER_HEIGHT) * MINIMAP_RATIO_Y + MINIMAP_OFFSET_Y),
      PLAYER_WIDTH * MINIMAP_RATIO_X * 1.5,
      PLAYER_HEIGHT * MINIMAP_RATIO_Y * 1.5
    )
  }
}
