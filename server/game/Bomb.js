// Bomb model: position (x, y), timer (3s countdown), blast radius, owner.
// On explosion: generates flame cells, triggers chain detonation of adjacent
// bombs, destroys brick tiles, and damages players in range.
import { randomUUID } from 'node:crypto';

export class Bomb {
    constructor(ownerId, row, col, blastRadius) {
        this.id = randomUUID();
        this.ownerId = ownerId;
        this.row = row;
        this.col = col;
        this.blastRadius = blastRadius;
        this.timer = null;
        this.detonated = false;
    }
}