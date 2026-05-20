import { hxs, mountApp, Store } from '../framework/index.js';
import { initialState } from './mockState.js';

const view = (state) => {
  const tiles = []
  state.map.forEach(row => {
    row.forEach(cell => {
      const tileClass = cell === 1 ? 'tile-wall' : cell === 2 ? 'tile-brick' : 'tile-floor'
      tiles.push(hxs('div', {class: `tile ${tileClass}`}))
    })
  });

  const board = hxs('div', { id: 'board' }, ...tiles);

  const boardContainer = hxs('div', { id: 'board-container' }, board);

    return hxs('div', { 
        id: 'game-wrapper',
        style: 'outline: none;'
    }, boardContainer);
}

const store = new Store(initialState);

mountApp(store, view, 'root')