// Board component: renders the 15×13 grid using the framework. Draws wall,
// brick, floor, and spawn tiles. Manages bomb entities with countdown
// animation, explosion overlays, and power-up item drops as children.

import { hxs } from "../lib/framework/index.js";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  TILE_SIZE,
  TILE,
} from "../../../shared/constants.js";

const TILE_CLASSES = {
  [TILE.FLOOR]: "tile-floor",
  [TILE.WALL]: "tile-wall",
  [TILE.BRICK]: "tile-brick",
};

export default function Board(grid, entities = []) {
  const tiles = grid.flat().map((cell, index) => {
    const tileClass = TILE_CLASSES[cell] || "tile-floor";
    return hxs("div", { class: `tile ${tileClass}`, key: index });
  });

  const boardStyle = `
    --cols: ${MAP_WIDTH};
    --rows: ${MAP_HEIGHT};
    --tile-size: ${TILE_SIZE}px;
  `;

  return hxs("div", { id: "board", style: boardStyle }, ...tiles, ...entities);
}
