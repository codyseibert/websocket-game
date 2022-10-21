const { loadTmxMap } = require("./loadTmxMap");

const maps = {
  default: "./public/maps/platforms.tmx",
};

exports.loadMap = async (mapName) => {
  const mapPath = maps[mapName];

  const tmxMap = await loadTmxMap(mapPath);
  const tiles = tmxMap.layers[0].tiles;

  const grid = [];
  for (let i = 0; i < tmxMap.height; i++) {
    const arr = [];
    for (let j = 0; j < tmxMap.width; j++) {
      const tile = tiles[i * tmxMap.width + j];
      arr.push(tile?.gid ?? 0);
    }
    grid.push(arr);
  }

  const firstTileSet = tmxMap.tileSets[0];

  return {
    grid,
    tileset: {
      image: firstTileSet.image.source.replace("..", ""),
      width: firstTileSet.image.width,
      height: firstTileSet.image.height,
      tileWidth: firstTileSet.tileWidth,
      tileHeight: firstTileSet.tileHeight,
    },
  };
};
