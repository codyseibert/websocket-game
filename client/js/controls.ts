export type CTR_UP = "up";
export type CTR_DOWN = "down";
export type CTR_LEFT = "left";
export type CTR_RIGHT = "right";
export type CTR_JUMP = "jump";
export type CTR_USE = "use";
export type CTR_ACTIONS =
  | CTR_UP
  | CTR_DOWN
  | CTR_LEFT
  | CTR_RIGHT
  | CTR_JUMP
  | CTR_USE;
export type KeyMap = Record<string, CTR_ACTIONS>;

let keyMap: KeyMap = {};
export const defaultKeymap: KeyMap = {
  w: "up",
  s: "down",
  a: "left",
  d: "right",
  " ": "jump",
  e: "use",
};

document.addEventListener("keydown", (e) => {
  activeControls[keyMap[e.key]] = true;
});

document.addEventListener("keyup", (e) => {
  activeControls[keyMap[e.key]] = false;
});

export function setKeymap(map: KeyMap) {
  keyMap = map;
}

export function getKeymap(): KeyMap {
  return { ...keyMap };
}

export const activeControls = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
  use: false,
};
