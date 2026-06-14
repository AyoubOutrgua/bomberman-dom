import { hxs } from "../lib/framework/index.js";

const TILE_SIZE = 48;

export const ExplosionsEntity = (explosions) => {
  const nodes = [];
  (explosions || []).forEach((exp) => {
    const frame = exp.frame || 0;
    exp.cells.forEach((cell, i) => {
      nodes.push(
        hxs("div", {
          key: `${exp.id}-${i}`,
          class: `entity-explosion rotate-${cell.rotation ?? 0}`,
          //   Addapting frame to style.
          style: `left:${cell.col * TILE_SIZE}px; top:${cell.row * TILE_SIZE}px; background-position: -${(exp.frame || 0) * TILE_SIZE}px 0px;`,
        }),
      );
    });
  });
  return nodes;
};
