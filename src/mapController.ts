const tmx = require("tmx-parser");
const { TILE_SIZE } = require("./constants");

let map = [[]];
let gameMap = {};
let collidables: any[] = [];

const maps = {
  default: "./public/maps/platforms.tmx",
};

const loadTmxMap = (filename: string): any => {
  return new Promise((resolve) => {
    tmx.parseFile(filename, function (err, map) {
      if (err) throw err;
      resolve(map);
    });
  });
};

export const loadMap = async (mapName) => {
  const mapPath = maps[mapName];

  const tmxMap = await loadTmxMap(mapPath);
  const tiles = tmxMap.layers[0].tiles;

  const grid: any[] = [];
  for (let i = 0; i < tmxMap.height; i++) {
    const arr: any[] = [];
    for (let j = 0; j < tmxMap.width; j++) {
      const tile = tiles[i * tmxMap.width + j];
      arr.push(tile?.gid ?? 0);
    }
    grid.push(arr);
  }

  const firstTileSet = tmxMap.tileSets[0];

  const newMap = {
    grid,
    tileset: {
      image: firstTileSet.image.source.replace("..", ""),
      width: firstTileSet.image.width,
      height: firstTileSet.image.height,
      tileWidth: firstTileSet.tileWidth,
      tileHeight: firstTileSet.tileHeight,
    },
  };

  map = newMap.grid;
  gameMap = newMap;

  collidables = [];
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      if (map[row][col] !== 0) {
        collidables.push({
          y: row * TILE_SIZE,
          x: col * TILE_SIZE,
        });
      }
    }
  }
};

export const getCollidables = () => collidables;

export const getGameMap = () => gameMap;
export const getMap = () => map;
