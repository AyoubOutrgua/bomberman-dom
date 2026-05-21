import { TILE_SIZE } from '../../../shared/constants.js';

export const isColliding = (nextX, nextY, map) => {
    const MARGIN_LEFT = 10;
    const MARGIN_RIGHT = 10;
    const MARGIN_TOP = 20;
    const MARGIN_BOTTOM = 2;

    const left = nextX + MARGIN_LEFT;
    const right = nextX + TILE_SIZE - MARGIN_RIGHT;
    const top = nextY + MARGIN_TOP;
    const bottom = nextY + TILE_SIZE - MARGIN_BOTTOM;

    const colLeft = Math.floor(left / TILE_SIZE);
    const colRight = Math.floor(right / TILE_SIZE);
    const rowTop = Math.floor(top / TILE_SIZE);
    const rowBottom = Math.floor(bottom / TILE_SIZE);

    const corners = [
        { r: rowTop, c: colLeft },
        { r: rowTop, c: colRight },
        { r: rowBottom, c: colLeft },
        { r: rowBottom, c: colRight }
    ];

    for (const corner of corners) {
        if (!map[corner.r] || 
            map[corner.r][corner.c] === undefined ||
            map[corner.r][corner.c] === 1 ||
            map[corner.r][corner.c] === 2 ) {
            return true;
        }
    }
    return false;
}