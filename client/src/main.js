import { mountApp } from "./lib/framework/index.js";

import Board from "./components/Board.js";
import { store } from "./lib/state.js";

function view(state) {
  return Board(state.map);
}

mountApp(store, view, "board-container");
