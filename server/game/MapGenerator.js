// 15×13 map generator: places indestructible walls in checkerboard pattern,
// randomly scatters destructible bricks avoiding 4 corner spawn zones (2×2),
// and returns a 2D array consumed by both server logic and client renderer.

import {
  MAP_WIDTH,
  MAP_HEIGHT,
  TILE,
  SPAWNS,
  BRICKS_COUNT,
} from "../../shared/constants.js";
import { shuffleArray } from "../utils.js";

export function generateMap() {
  let map = [];
  for (let row = 0; row < MAP_HEIGHT; row++) {
    let mapRow = [];
    for (let col = 0; col < MAP_WIDTH; col++) {
      mapRow.push(isWallPos(row, col) ? TILE.WALL : TILE.FLOOR);
    }
    map.push(mapRow);
  }

  map = generateBricks(map);

  return map;
}

function isWallPos(row, col) {
  return (
    row === 0 ||
    col === 0 ||
    row === MAP_HEIGHT - 1 ||
    col === MAP_WIDTH - 1 ||
    (row % 2 === 0 && col % 2 === 0)
  );
}

function generateBricks(map) {
  let candidates = [];
  for (let row = 0; row < MAP_HEIGHT; row++) {
    for (let col = 0; col < MAP_WIDTH; col++) {
      const cell = map[row][col];
      if (isBrickCandidate(cell, row, col)) {
        candidates.push([row, col]);
      }
    }
  }

  candidates = shuffleArray(candidates);

  const bricksCount = Math.min(BRICKS_COUNT, candidates.length);

  for (let i = 0; i < bricksCount; i++) {
    const [row, col] = candidates[i];

    map[row][col] = TILE.BRICK;
  }

  return map;
}

function isBrickCandidate(cell, row, col) {
  return cell === TILE.FLOOR && !isSafeZone(row, col);
}

function isSafeZone(row, col) {
  return SPAWNS.some((spwn) => {
    const rowDistance = Math.abs(row - spwn.row);
    const colDistance = Math.abs(col - spwn.col);

    return rowDistance <= 1 && colDistance <= 1;
  });
}

export function destroyBrick(map, row, col) {
  if (map[row][col] !== TILE.BRICK) return;

  map[row][col] = TILE.FLOOR;
}
