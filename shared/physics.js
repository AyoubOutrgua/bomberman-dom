import { TILE_SIZE } from './constants.js';

export const isColliding = (nextX, nextY, currentX, currentY, map) => {
    const MARGIN_LEFT = 10;
    const MARGIN_RIGHT = 10;
    const MARGIN_TOP = 20;
    const MARGIN_BOTTOM = 2;

    const nextLeft = nextX + MARGIN_LEFT;
    const nextRight = nextX + TILE_SIZE - MARGIN_RIGHT;
    const nextTop = nextY + MARGIN_TOP;
    const nextBottom = nextY + TILE_SIZE - MARGIN_BOTTOM;

    const colLeft = Math.floor(nextLeft / TILE_SIZE);
    const colRight = Math.floor(nextRight / TILE_SIZE);
    const rowTop = Math.floor(nextTop / TILE_SIZE);
    const rowBottom = Math.floor(nextBottom / TILE_SIZE);

    const corners = [
        { r: rowTop, c: colLeft },
        { r: rowTop, c: colRight },
        { r: rowBottom, c: colLeft },
        { r: rowBottom, c: colRight }
    ];

    for (const corner of corners) {
        if (!map[corner.r] || map[corner.r][corner.c] === undefined) {
            return true;
        }

        const cell = map[corner.r][corner.c];

        if (cell === 1 || cell === 2) {
            return true;
        }

        if (cell === 3) {
            const currentLeft = currentX + MARGIN_LEFT;
            const currentRight = currentX + TILE_SIZE - MARGIN_RIGHT;
            const currentTop = currentY + MARGIN_TOP;
            const currentBottom = currentY + TILE_SIZE - MARGIN_BOTTOM;

            const bombLeft = corner.c * TILE_SIZE;
            const bombRight = (corner.c + 1) * TILE_SIZE;
            const bombTop = corner.r * TILE_SIZE;
            const bombBottom = (corner.r + 1) * TILE_SIZE;

            const isOverlapping = 
                currentLeft < bombRight &&
                currentRight > bombLeft &&
                currentTop < bombBottom &&
                currentBottom > bombTop;

            if (!isOverlapping) {
                return true; 
            }
        }
    }
    
    return false;
}