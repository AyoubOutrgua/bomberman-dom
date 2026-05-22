// Player model: id, nickname, color, lives (3), grid position (x, y),
// bomb count, blast radius, speed multiplier. Tracks alive/dead state and
// power-up inventory. Reset on round start.

export class Player {
    constructor(id, nickname, color, startX, startY) {
        this.id = id;
        this.nickname = nickname; 
        this.color = color;
        
        this.lives = 3;
        this.isAlive = true;
        
        this.x = startX;
        this.y = startY;
        this.speed = 1.5;
        this.direction = 'ArrowDown';
        this.frame = 0;
        this.isMoving = false;
        
        this.bombCount = 1;
        this.blastRadius = 1;
    }
}