const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("ping", () => {
    socket.emit("pong", "yolo");
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
