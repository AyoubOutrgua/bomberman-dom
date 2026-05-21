// /client/src/main.js

import { hxs, mountApp } from '../framework/index.js';
import { store } from './lib/state.js';
import { Board } from './components/Board.js';
import { gameLoop, keys } from './lib/loop.js';


const appView = (state) => {
    return Board(state)
};

mountApp(store, appView, 'board-container');

setTimeout(() => {
    const wrapper = document.getElementById('board-container');
    if (wrapper) wrapper.focus();
}, 0);

requestAnimationFrame(gameLoop);