import { hxs } from '../lib/framework/index.js';

export const ExplosionsEntity = (explosions) => {
    const nodes = [];
    const TILE_SIZE = 48;
    (explosions || []).forEach(exp => {
        exp.cells.forEach((cell, i) => {
            nodes.push(hxs('div', {
                key: `${exp.id}-${i}`,
                class: `entity-explosion rotate-${cell.rotation ?? 0}`,
                style: `left:${cell.col * TILE_SIZE}px; top:${cell.row * TILE_SIZE}px;`
            }));
        });
    });
    return nodes;
};