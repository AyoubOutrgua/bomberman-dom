// Board component: renders the 15×13 grid using the framework. Draws wall,
// brick, floor, and spawn tiles. Manages bomb entities with countdown
// animation, explosion overlays, and power-up item drops as children.

import { hxs } from '../../framework/dom.js';
import { PlayerEntity } from './PlayerEntity.js';
import { keys } from '../lib/loop.js';

const handleKeyDown = (e) => {
    console.log('key down ++++++++++++++++++');
    if (keys[e.key] !== undefined) {
        for (const key of Object.keys(keys)) {
            keys[key] = false;
        }
        keys[e.key] = true;
    }
};

const handleKeyUp = (e) => {
    console.log('key up ++++++++++++++++++');
    if (keys[e.key] !== undefined) {
        keys[e.key] = false;
    }
};

export const Board = (state) => {
    const tiles = [];
    state.map.forEach(row => {
      row.forEach(cell => {
        const tileClass = cell === 1 ? 'tile-wall' : cell === 2 ? 'tile-brick' : 'tile-floor';
        tiles.push(hxs('div', {class: `tile ${tileClass}`}));
      });
    });
  
    const player = PlayerEntity(state.player);
  
    const board = hxs('div', 
      { 
        id: 'board',
        tabindex: '0',
        style: 'outline: none;',
        onkeydown: handleKeyDown,
        onkeyup: handleKeyUp,
      }, ...tiles, player);
    return  board;
};