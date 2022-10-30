export enum CTR_ACTIONS {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  JUMP = "jump",
  USE = "use",
}

export type KeyMap = Record<string, CTR_ACTIONS>;

let keyMap: KeyMap = {};
export const defaultKeymap: KeyMap = {
  w: CTR_ACTIONS.JUMP,
  s: CTR_ACTIONS.DOWN,
  a: CTR_ACTIONS.LEFT,
  d: CTR_ACTIONS.RIGHT,
  e: CTR_ACTIONS.USE,
  " ": CTR_ACTIONS.JUMP,
  ArrowUp: CTR_ACTIONS.JUMP,
  ArrowDown: CTR_ACTIONS.LEFT,
  ArrowLeft: CTR_ACTIONS.LEFT,
  ArrowRight: CTR_ACTIONS.RIGHT,
};

export const activeControls = {
  up: false,
  down: false,
  left: false,
  right: false,
  use: false,
  jump: false,
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

export function isCommandDown(command: CTR_ACTIONS) {
  return !!activeControls[command];
}