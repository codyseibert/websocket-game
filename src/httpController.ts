import express from "express";
import http from "http";
import { PORT } from "./constants";

export const startServer = () => {
  const app = express();
  const server = http.createServer(app);

  app.use(express.static("dist"));

  server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
  });

  return server;
};