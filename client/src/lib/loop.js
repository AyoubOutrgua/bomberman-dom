// requestAnimationFrame game loop: drives 60fps rendering cycles. Polls
// state diffs, triggers framework re-render, handles keyboard input, and
// provides delta-time for smooth animation interpolation.

import { store } from './state.js';
import { isColliding } from '../../../shared/physics.js';
import { FRAMES } from '../../../shared/constants.js';

export const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

let frameCounter = 0;

export const gameLoop = () => {
  const p = store.state.players[store.state.myId];
  let isMoving = false;
  let newDir = p.direction;
  let nextX = p.x;
  let nextY = p.y;

  if (keys.ArrowUp)    { nextY -= p.speed; newDir = 'ArrowUp';    isMoving = true; }
  if (keys.ArrowDown)  { nextY += p.speed; newDir = 'ArrowDown';  isMoving = true; }
  if (keys.ArrowLeft)  { nextX -= p.speed; newDir = 'ArrowLeft';  isMoving = true; }
  if (keys.ArrowRight) { nextX += p.speed; newDir = 'ArrowRight'; isMoving = true; }

  if (isMoving) {
    frameCounter += 1;
    if (frameCounter > 5) { 
        p.frame = (p.frame + 1) % FRAMES[newDir].cols;
        frameCounter = 0;
    }
  } else {
    p.frame = 0;
  }

  if (!isColliding(nextX, nextY, store.state.map)) {
      p.x = nextX;
      p.y = nextY;
  }
  p.direction = newDir;
  p.isMoving = isMoving;

  requestAnimationFrame(gameLoop);
};