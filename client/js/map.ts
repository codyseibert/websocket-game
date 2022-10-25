import tilesheetUrl from "../images/tilesheet.png";
import decalsUrl from "../images/decals.png";
import bgUrl from "../images/bg.png";
import { TILE_SIZE } from "./constants";

let map: TGameMap | null = null;

const bgImage = new Image();
bgImage.src = bgUrl;
const mapImage = new Image();
mapImage.src = tilesheetUrl;
const decalImage = new Image();
decalImage.src = decalsUrl;

export function setMap(newMap: TGameMap) {
  map = newMap;
}

function getTileImageLocation(id: number, metadata: any) {
  if (!map) return { x: 0, y: 0 };
  const cols = metadata.width / TILE_SIZE;
  const x = ((id - 1) % cols) * TILE_SIZE;
  const y = Math.floor((id - 1) / cols) * TILE_SIZE;
  return {
    x,
    y,
  };
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  tileType,
  toDraw,
  col: number,
  row: number,
  cx: number,
  cy: number
) {
  if (tileType !== 0) {
    const { x, y } = getTileImageLocation(tileType, map!!.grid.metadata);
    ctx.drawImage(
      toDraw,
      x,
      y,
      TILE_SIZE,
      TILE_SIZE,
      Math.floor(col * TILE_SIZE - cx),
      Math.floor(row * TILE_SIZE - cy),
      TILE_SIZE,
      TILE_SIZE
    );
  }
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number
) {
  ctx.drawImage(
    bgImage,
    0,
    0,
    bgImage.width,
    bgImage.height,
    0 - cx / 20 - 50,
    0 - cy / 20 - 50,
    bgImage.width,
    bgImage.height
  );
}

export function drawTiles(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number
) {
  if (!map) return;

  for (let row = 0; row < map.grid.tiles.length; row++) {
    for (let col = 0; col < map.grid.tiles[row].length; col++) {
      drawTile(ctx, map.grid.tiles[row][col], mapImage, col, row, cx, cy);
    }
  }

  for (let row = 0; row < map.decals.tiles.length; row++) {
    for (let col = 0; col < map.decals.tiles[row].length; col++) {
      const tileType = map.decals.tiles[row][col];

      if (tileType !== 0) {
        const { x, y } = getTileImageLocation(tileType, map.decals.metadata);
        ctx.drawImage(
          decalImage,
          x,
          y,
          TILE_SIZE,
          TILE_SIZE,
          Math.floor(col * TILE_SIZE - cx),
          Math.floor(row * TILE_SIZE - cy),
          TILE_SIZE,
          TILE_SIZE
        );

        if (tileType === 32) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `16px Verdana`;
          ctx.fillText(
            "Teleport (e)",
            Math.floor(col * TILE_SIZE - cx + 20),
            Math.floor(row * TILE_SIZE - cy)
          );
        }
      }
    }
  }
}
