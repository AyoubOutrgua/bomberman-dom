import { hxs, mountApp, Store } from '../framework/index.js';
import { initialState } from './mockState.js';

const FRAMES = {
    ArrowUp:    { row: 8,  cols: 9 }, 
    ArrowLeft:  { row: 9,  cols: 9 }, 
    ArrowDown:  { row: 10, cols: 9 }, 
    ArrowRight: { row: 11, cols: 9 }, 
};

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

const handleKeyDown = (e) => {
    if (keys[e.key] !== undefined) {
        keys[e.key] = true;
    }
};

const handleKeyUp = (e) => {
    if (keys[e.key] !== undefined) {
        keys[e.key] = false;
    }
};

const view = (state) => {
  const tiles = []
  state.map.forEach(row => {
    row.forEach(cell => {
      const tileClass = cell === 1 ? 'tile-wall' : cell === 2 ? 'tile-brick' : 'tile-floor'
      tiles.push(hxs('div', {class: `tile ${tileClass}`}))
    })
  });

  const p = state.player;
    
  const IMAGE_FRAME_SIZE = 64;
  
  const bgPosX = p.frame * IMAGE_FRAME_SIZE; 
  const bgPosY = FRAMES[p.direction].row * IMAGE_FRAME_SIZE;

  const offsetX = p.x - 8;
  const offsetY = p.y - 16;

  const player = hxs('div', {
    class: 'player player-01',
    style: `
        left: ${offsetX}px;
        top: ${offsetY}px;
        width: ${IMAGE_FRAME_SIZE}px;
        height: ${IMAGE_FRAME_SIZE}px;
        background-position: -${bgPosX}px -${bgPosY}px;
    `
  });


  const board = hxs('div', { id: 'board' }, ...tiles, player);

  const boardContainer = hxs('div', { id: 'board-container' }, board);

    return hxs('div', { 
        id: 'game-wrapper',
        tabindex: '0',
        onkeydown: handleKeyDown,
        onkeyup: handleKeyUp,
        style: 'outline: none;'
    }, boardContainer);
}

const store = new Store(initialState);

mountApp(store, view, 'root')

setTimeout(() => {
    const wrapper = document.getElementById('game-wrapper');
    if (wrapper) wrapper.focus();
}, 0);

let frameCounter = 0

const gameLoop = () => {
  const p = store.state.player
  let isMoving = false
  let newDir = p.direction
  let nextX = p.x
  let nextY = p.y

  if (keys.ArrowUp)    { nextY -= p.speed; newDir = 'ArrowUp';    isMoving = true; }
  if (keys.ArrowDown)  { nextY += p.speed; newDir = 'ArrowDown';  isMoving = true; }
  if (keys.ArrowLeft)  { nextX -= p.speed; newDir = 'ArrowLeft';  isMoving = true; }
  if (keys.ArrowRight) { nextX += p.speed; newDir = 'ArrowRight'; isMoving = true; }

  if (isMoving) {
    frameCounter += 1
    if (frameCounter > 5) { 
        p.frame = (p.frame + 1) % FRAMES[newDir].cols
        frameCounter = 0
    }
  } else {
    p.frame = 0
  }

  p.x = nextX;
  p.y = nextY;
  p.direction = newDir;
  p.isMoving = isMoving;

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop)