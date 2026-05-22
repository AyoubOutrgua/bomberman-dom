// 15×13 map generator: places indestructible walls in checkerboard pattern,
// randomly scatters destructible bricks avoiding 4 corner spawn zones (2×2),
// and returns a 2D array consumed by both server logic and client renderer.

import { MAP_WIDTH, MAP_HEIGHT, TILE, SPAWNS } from "../../shared/constants";

const GRID = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export function getGrid() {
  return Grid.map((row) => [...row]);
}

function isBrickCandidate(cell, row, col) {
  if (cell !== TILE.FLOOR) return false;

  SPAWNS.forEach((spwn) => {
    if (spwn.row === row && spwn.col === col) {
        return
    }
  });
}

function generateBricks() {
  const candidates = [];
  for (let row = 0; row < HEIGHT.length; row++) {
    for (let col = 0; col < WIDTH.length; col++) {
      const cell = MAP[row][col];
    }
  }
}
