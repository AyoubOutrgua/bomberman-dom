// Shared game constants used by both client and server.
// GRID: 15 columns × 13 rows, TILE_SIZE = 48px.
// BOMB_TIMER = 3000ms, BLAST_RADIUS starts at 1, up to 5 with power-ups.
// INITIAL_LIVES = 3, LOBBY_WAIT = 20s, COUNTDOWN = 10s, MAX_PLAYERS = 4.

// ----- MAP -----
export const TILE_SIZE = 48;

// Map dims
export const MAP_WIDTH = 15;
export const MAP_HEIGHT = 13;

// Tile types grid representations
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  BRICK: 2,
};

// Players spawn positions
export const SPAWNS = [
  { row: 1, col: 1 }, // top-left
  { row: 1, col: 13 }, // top-right
  { row: 11, col: 1 }, // bottom-left
  { row: 11, col: 13 }, // bottom-right
];

export const BRICKS_COUNT = 45;

// ----- ANIMATIONS -----
export const IMAGE_FRAME_SIZE = 64;
export const FRAMES = {
  ArrowUp: { row: 0, cols: 8 },
  ArrowLeft: { row: 1, cols: 8 },
  ArrowDown: { row: 2, cols: 8 },
  ArrowRight: { row: 3, cols: 8 },
};


//---bombs---
// Combat Constants
export const BOMB_TIMER = 3000;
export const BLAST_RADIUS_DEFAULT = 1;
export const BLAST_RADIUS_MAX = 5;
export const BOMB_MAX_DEFAULT = 1;
export const SPEED_DEFAULT = 1.5;
export const SPEED_MAX = 3.0;
export const SPEED_INCREMENT = 0.5;
export const ITEM_TYPES = { BOMB: 'bomb', FLAME: 'flame', SPEED: 'speed' };
export const ITEM_DROP_CHANCE = 0.3;