import { mountApp } from "./lib/framework/index.js";

import Board from "./components/Board.js";
import { PlayersEntity } from "./components/PlayersEntity.js";
import { store } from "./lib/state.js";
import { gameLoop, keys } from "./lib/loop.js";

function view(state) {
  return Board(state.map, PlayersEntity(state.players));
}

mountApp(store, view, "board-container");

// Keyboard input
window.addEventListener("keydown", (e) => {
  if (e.key in keys) {
    e.preventDefault();
    keys[e.key] = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key in keys) {
    e.preventDefault();
    keys[e.key] = false;
  }
});

// Start game loop
requestAnimationFrame(gameLoop);
