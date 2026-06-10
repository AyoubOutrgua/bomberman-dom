// Reactive state store: holds client-side game state — phase (lobby/active),
// player list, map grid, bomb positions, scores, chat history. Emits change
// events so components re-render on state transitions.

import { Store } from "./framework/index.js";
import { generateMap } from "../../../server/game/MapGenerator.js";
import { SPAWNS, TILE_SIZE } from "../../../shared/constants.js";

const BASE_MAP = generateMap();

function createPlayer(spwnIndex) {
  const spawn = SPAWNS[spwnIndex];
  return {
    x: spawn.col * TILE_SIZE,
    y: spawn.row * TILE_SIZE,
    speed: 1.5,
    direction: "ArrowDown",
    frame: 0,
    isMoving: false,
  };
}

export const initialState = {
  roomId: "room-01",
  myId: "P1",
  map: generateMap(),
  players: {
    P1: createPlayer(0),
    P2: createPlayer(1),
    P3: createPlayer(2),
    P4: createPlayer(3),
  },
};

export const store = new Store(initialState);
