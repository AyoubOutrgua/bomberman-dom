// requestAnimationFrame game loop: drives 60fps rendering cycles. Polls
// state diffs, triggers framework re-render, handles keyboard input, and
// provides delta-time for smooth animation interpolation.

import { store } from './state.js';
import { isColliding } from '../../../shared/physics.js';
import { FRAMES } from '../../../shared/constants.js';

export const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

let isRunning = false;

export const startGameLoop = () => {
    if (isRunning) return;
    isRunning = true;
    requestAnimationFrame(gameLoop);
};

export const gameLoop = () => {
  const myId = store.state.lobby.myId;
  const players = store.state.game.players;  
  
  if (!players) {
      requestAnimationFrame(gameLoop);
      return;
  }

  const p = players[myId];
  if (p) {
      let isMoving = false;
      let newDir = p.direction;
      let nextX = p.x;
      let nextY = p.y;

      if (keys.ArrowUp)    { nextY -= p.speed; newDir = 'ArrowUp';    isMoving = true; }
      if (keys.ArrowDown)  { nextY += p.speed; newDir = 'ArrowDown';  isMoving = true; }
      if (keys.ArrowLeft)  { nextX -= p.speed; newDir = 'ArrowLeft';  isMoving = true; }
      if (keys.ArrowRight) { nextX += p.speed; newDir = 'ArrowRight'; isMoving = true; }

      if (isMoving) {    
        p.frameCounter = (p.frameCounter || 0) + 1;
        if (p.frameCounter > 5) { 
            p.frame = (p.frame + 1) % FRAMES[newDir].cols;
            p.frameCounter = 0;
        }
      } else {
        p.frame = 0;
      }

      if (isMoving && !isColliding(nextX, nextY, store.state.game.map)) {
          p.x = nextX;
          p.y = nextY;
      }
      p.direction = newDir;
      p.isMoving = isMoving;
  }

  for (const id in players) {
      if (id === myId) continue;
      
      const enemy = players[id];
      if (enemy.isMoving) {
          enemy.frameCounter = (enemy.frameCounter || 0) + 1;
          if (enemy.frameCounter > 5) { 
              enemy.frame = (enemy.frame + 1) % FRAMES[enemy.direction].cols;
              enemy.frameCounter = 0;
          }
      } else {
          enemy.frame = 0;
      }
  }

  requestAnimationFrame(gameLoop);
};