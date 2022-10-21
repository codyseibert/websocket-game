const tmx = require("tmx-parser");

exports.loadTmxMap = (filename) => {
  return new Promise((resolve) => {
    tmx.parseFile(filename, function (err, map) {
      if (err) throw err;
      resolve(map);
    });
  });
};
