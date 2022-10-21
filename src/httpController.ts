import express from "express";
import http from "http";
import { PORT } from "./constants";

export const app = express();
export const server = http.createServer(app);

app.use(express.static("public"));

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
