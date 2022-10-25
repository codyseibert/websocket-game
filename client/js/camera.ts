import { getCanvasSize } from "./canvas";
import { getInterpolations, getMyPlayer } from "./player";

export function getCamera() {
  const { width, height } = getCanvasSize();
  const playerToFocus = getMyPlayer();
  return {
    cx: playerToFocus ? getInterpolations()[playerToFocus.id].x - width / 2 : 0,
    cy: playerToFocus
      ? getInterpolations()[playerToFocus.id].y - height / 2
      : 0,
  };
}
