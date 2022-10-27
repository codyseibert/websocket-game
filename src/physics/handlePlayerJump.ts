import { CONTROLS, JUMP_SPEED, TControlMap } from "../constants";

export function handlePlayerJump(
  player: TPlayer,
  canJump: boolean,
  controls: TControlMap,
  turnJumpOff: () => void
) {
  if (controls[CONTROLS.JUMP] && canJump) {
    turnJumpOff();
    player.vy = JUMP_SPEED;
    controls[CONTROLS.JUMP] = false;
  }
}
