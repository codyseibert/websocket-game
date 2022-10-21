import { startServer } from "./httpController";
import { startSocketController } from "./socketController";

const server = startServer();
startSocketController(server);
