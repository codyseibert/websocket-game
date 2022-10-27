import { getCanvasSize } from "./canvas";
import { getMyPlayer } from "./player";

export type Camera = {
  cx: number;
  cy: number;
};

export function getCamera() {
  const { width, height } = getCanvasSize();
  const playerToFocus = getMyPlayer();
  return {
    cx: playerToFocus ? playerToFocus.x - width / 2 : 0,
    cy: playerToFocus ? playerToFocus.y - height / 2 : 0,
  } as Camera;
}
