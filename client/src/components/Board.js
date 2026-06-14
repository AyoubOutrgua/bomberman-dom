// Board component: renders the 15×13 grid using the framework. Draws wall,
// brick, floor, and spawn tiles. Manages bomb entities with countdown
// animation, explosion overlays, and power-up item drops as children.

import { hxs } from "../lib/framework/index.js";

import { keys } from "../lib/loop.js";
import { sendPlayerMove, sendPlaceBomb } from "../lib/network.js";

import { PlayersEntity } from "./PlayersEntity.js";
import { BombsEntity } from "./BombsEntity.js";
import { ExplosionsEntity } from "./ExplosionsEntity.js";
import { ItemsEntity } from "./ItemsEntity.js";

import { TILE } from "../../../shared/constants.js";

//----------------

const keyupTimeouts = {};

const handleKeyDown = (e) => {
  // TASK 4: Handle spacebar for placing bombs without scrolling the page
  if (e.key === " ") {
    e.preventDefault();
    sendPlaceBomb();
    return;
  }

  if (keys[e.key] !== undefined) {
    if (keyupTimeouts[e.key]) {
      clearTimeout(keyupTimeouts[e.key]);
      keyupTimeouts[e.key] = null;
    }

    const isFirstPress = !keys[e.key];

    for (const key of Object.keys(keys)) {
      if (key !== e.key) keys[key] = false;
    }

    keys[e.key] = true;

    if (isFirstPress) {
      sendPlayerMove(e.key);
    }
  }
};

const handleKeyUp = (e) => {
  if (keys[e.key] !== undefined) {
    keyupTimeouts[e.key] = setTimeout(() => {
      keys[e.key] = false;

      const isAnyKeyDown = Object.values(keys).some((val) => val === true);
      if (!isAnyKeyDown) {
        sendPlayerMove("none");
      }
    }, 50);
  }
};

export const Board = (state) => {
  const tiles = [];
  if (state.game.map) {
    state.game.map.forEach((row) => {
      row.forEach((cell) => {
        const tileClass =
          cell === TILE.WALL
            ? "tile-wall"
            : cell === TILE.BRICK
              ? "tile-brick"
              : "tile-floor";
        tiles.push(hxs("div", { class: `tile ${tileClass}` }));
      });
    });
  }

  const players = PlayersEntity(state.game.players);

  const board = hxs(
    "div",
    {
      id: "board",
      tabindex: "0",
      style: "outline: none; --cols: 15; --rows: 13; --tile-size: 48px;",
      onkeydown: handleKeyDown,
      onkeyup: handleKeyUp,
    },
    ...tiles,
    ...BombsEntity(state.game.bombs),
    ...ExplosionsEntity(state.game.explosions),
    ...ItemsEntity(state.game.items),
    ...players,
  );
  return board;
};
