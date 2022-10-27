import { CONTROLS, TILE_SIZE } from "./constants";
import { getPlayerBoundingBox, getPortalBoundingBox, isOverlap } from "./geom";
import { getPortals } from "./mapController";
import { getControlsForPlayer } from "./socketController";

const canTeleport: Record<string, boolean> = {};
const TELEPORT_TIMEOUT = 1000;

export function handlePortalLogic(players: TPlayer[]) {
  const portals = getPortals();
  for (let player of players) {
    if (canTeleport[player.id] === undefined) {
      canTeleport[player.id] = true;
    }

    const controls = getControlsForPlayer(player.id);
    for (const portal of portals) {
      if (
        controls[CONTROLS.USE] &&
        isOverlap(getPlayerBoundingBox(player), getPortalBoundingBox(portal)) &&
        canTeleport[player.id]
      ) {
        controls[CONTROLS.USE] = false;
        const otherPortals = portals.filter((p) => p !== portal);
        const randomPortal =
          otherPortals[Math.floor(Math.random() * otherPortals.length)];
        player.x = randomPortal.x + TILE_SIZE / 2;
        player.y = randomPortal.y + TILE_SIZE / 2;
        canTeleport[player.id] = false;
        setTimeout(() => {
          canTeleport[player.id] = true;
        }, TELEPORT_TIMEOUT);
        break;
      }
    }
  }
}
