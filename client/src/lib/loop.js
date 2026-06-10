import { store } from './state.js';
import { FRAMES } from '../../../shared/constants.js';
import { sendPlayerMove } from '../lib/network.js';

export const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

let isRunning = false;
let lastSentDir = 'none';

let startTime = null;
let timerDOM = null;
let lastSeconds = -1;

export const startGameLoop = () => {
    if (isRunning) return;
    isRunning = true;
    startTime = Date.now();
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
      let currentDir = 'none';
      let isMoving = false;

      if (keys.ArrowUp)    { currentDir = 'ArrowUp'; isMoving = true; }
      else if (keys.ArrowDown)  { currentDir = 'ArrowDown'; isMoving = true; }
      else if (keys.ArrowLeft)  { currentDir = 'ArrowLeft'; isMoving = true; }
      else if (keys.ArrowRight) { currentDir = 'ArrowRight'; isMoving = true; }

      if (currentDir !== 'none') {
          sendPlayerMove(currentDir);
      } else if (lastSentDir !== 'none') {
          sendPlayerMove('none'); 
      }
      lastSentDir = currentDir;

      if (isMoving) {    
        p.frameCounter = (p.frameCounter || 0) + 1;
        if (p.frameCounter > 5) { 
            p.frame = (p.frame + 1) % FRAMES[currentDir].cols;
            p.frameCounter = 0;
        }
        p.direction = currentDir;
      } else {
        if (p.frame !== 0) p.frame = 0;
      }
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
          if (enemy.frame !== 0) enemy.frame = 0;
      }
  }

  if (!timerDOM) {
      timerDOM = document.createElement('div');
      timerDOM.id = 'game-timer-display';
      document.body.appendChild(timerDOM);
  }

  if (timerDOM && startTime) {
      const elapsed = Date.now() - startTime;
      const totalSeconds = Math.floor(elapsed / 1000);
      
      if (totalSeconds !== lastSeconds) {
          const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
          const seconds = (totalSeconds % 60).toString().padStart(2, '0');
          timerDOM.innerText = `${minutes}:${seconds}`;
          lastSeconds = totalSeconds;
      }

      timerDOM.style.opacity = timerDOM.style.opacity === '1' ? '0.99' : '1';
  }

  requestAnimationFrame(gameLoop);
};