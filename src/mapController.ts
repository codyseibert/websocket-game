const tmx = require("tmx-parser");
const { TILE_SIZE } = require("./constants");

let gameMap: TGameMap;
let collidables: TPoint[] = [];
let portals: TPoint[] = [];

const PORTAL_TILE_ID = 32;

type TMXTileSet = {
  firstGid: number;
  source: string;
  name: string;
  tileWidth: number;
  tileHeight: number;
  spacing: any;
  margin: any;
  tileOffset: any[];
  properties: {};
  image: {
    width: number;
    height: number;
  };
  tiles: any[];
  terrainTypes: any[];
};

type TMXLayer = {
  map: any[];
  type: string;
  name: string;
  opacity: number;
  visible: boolean;
  properties: any;
  tiles: any[];
  horizontalFlips: any[];
  verticalFlips: any[];
  diagonalFlips: any[];
};

type TMXMap = {
  version: string;
  orientation: string;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  backgroundColor: string;
  layers: TMXLayer[];
  properties: any;
  tileSets: TMXTileSet[];
};

const maps = {
  default: "./maps/platforms.tmx",
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

  const tmxMap: TMXMap = await loadTmxMap(mapPath);

  const grid: any[] = [];
  const gridTiles = tmxMap.layers[0].tiles;
  for (let i = 0; i < tmxMap.height; i++) {
    const arr: any[] = [];
    for (let j = 0; j < tmxMap.width; j++) {
      const tile = gridTiles[i * tmxMap.width + j];
      arr.push(tile?.gid ? tile.gid - tmxMap.tileSets[0].firstGid + 1 : 0);
    }
    grid.push(arr);
  }

  const decals: any[] = [];
  const tmxDecals = tmxMap.layers[1].tiles;
  for (let i = 0; i < tmxMap.height; i++) {
    const arr: any[] = [];
    for (let j = 0; j < tmxMap.width; j++) {
      const tile = tmxDecals[i * tmxMap.width + j];
      if (!tile) {
        arr.push(0);
        continue;
      }
      const gid = tile.gid - tmxMap.tileSets[1].firstGid + 1;
      arr.push(gid);

      if (PORTAL_TILE_ID === gid) {
        portals.push({
          y: i * TILE_SIZE,
          x: j * TILE_SIZE,
        });
      }
    }
    decals.push(arr);
  }

  const newMap: TGameMap = {
    grid: {
      tiles: grid,
      metadata: {
        width: tmxMap.tileSets[0].image.width,
        height: tmxMap.tileSets[0].image.height,
        tileWidth: tmxMap.tileSets[0].tileWidth,
        tileHeight: tmxMap.tileSets[0].tileHeight,
      },
    },
    decals: {
      tiles: decals,
      metadata: {
        width: tmxMap.tileSets[1].image.width,
        height: tmxMap.tileSets[1].image.height,
        tileWidth: tmxMap.tileSets[1].tileWidth,
        tileHeight: tmxMap.tileSets[1].tileHeight,
      },
    },
  };

  gameMap = newMap;

  collidables = [];
  for (let row = 0; row < newMap.grid.tiles.length; row++) {
    for (let col = 0; col < newMap.grid.tiles[row].length; col++) {
      if (newMap.grid.tiles[row][col] !== 0) {
        collidables.push({
          y: row * TILE_SIZE,
          x: col * TILE_SIZE,
        });
      }
    }
  }
};

const ZOMBIE_SPAWN: TPoint = {
  x: 3055,
  y: 200,
};

const HUMAN_SPAWN: TPoint = {
  x: 400,
  y: 100,
};

export const getZombieSpawn = () => ZOMBIE_SPAWN;
export const getHumanSpawn = () => HUMAN_SPAWN;

export const getCollidables = () => collidables;
export const getPortals = () => portals;

export const getGameMap = () => gameMap;
