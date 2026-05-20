import { hxs, mountApp, Store } from '../framework/index.js';
import { initialState } from './mockState.js';

const FRAMES = {
    ArrowUp:    { row: 8,  cols: 9 }, 
    ArrowLeft:  { row: 9,  cols: 9 }, 
    ArrowDown:  { row: 10, cols: 9 }, 
    ArrowRight: { row: 11, cols: 9 }, 
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
        style: 'outline: none;'
    }, boardContainer);
}

const store = new Store(initialState);

mountApp(store, view, 'root')