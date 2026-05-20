const BASE_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const board = document.getElementById("board");

/* ===========================
   BOARD LAYER
   =========================== */

for (let row = 0; row < BASE_MAP.length; row++) {
  for (let col = 0; col < BASE_MAP[row].length; col++) {
    const cell = BASE_MAP[row][col];

    const tile = document.createElement("div");
    tile.classList.add("tile");

    switch (cell) {
      case 0:
      case 2:
        tile.classList.add("tile-floor");
        break;

      case 1:
        tile.classList.add("tile-wall");
        break;
    }

    board.appendChild(tile);
  }
}

/* ===========================
   ENTITY LAYER
   =========================== */

const enemy = document.createElement("div");

enemy.classList.add("entity", "enemy-skeleton");

enemy.style.left = `${1 * 48}px`;
enemy.style.top = `${1 * 48}px`;

board.appendChild(enemy);

/* ===========================
   ANIMATION & MOVEMENT
   =========================== */

const TILE = 48;
const SCALE = 0.75; // 48/64
const SHEET_W = 832 * SCALE; // 624
const SHEET_H = 256 * SCALE; // 192
const FRAME_W = 64 * SCALE; // 48
const FRAME_H = 64 * SCALE; // 48
const FRAME_COUNT = 9;
const FPS = 10;

// LPC row order: 0=North, 1=West, 2=South, 3=East
const DIR = { up: 0, left: 1, down: 2, right: 3 };

const state = {
  x: 1,
  y: 1, // grid position
  dir: 2, // facing south by default
  frame: 0,
  moving: false,
  keys: new Set(),
};

// --- Frame ticker ---
let lastFrameTime = 0;
setInterval(() => {
  if (state.moving) {
    state.frame = (state.frame + 1) % FRAME_COUNT;
  } else {
    state.frame = 0;
  }
  applySprite();
}, 1000 / FPS);

function applySprite() {
  const ox = -(state.frame * FRAME_W);
  const oy = -(state.dir * FRAME_H);
  enemy.style.backgroundPosition = `${ox}px ${oy}px`;
}

function tryMove(dx, dy, dir) {
  const nx = state.x + dx;
  const ny = state.y + dy;
  state.dir = dir;

  if (
    ny >= 0 &&
    ny < BASE_MAP.length &&
    nx >= 0 &&
    nx < BASE_MAP[0].length &&
    BASE_MAP[ny][nx] !== 1
  ) {
    state.x = nx;
    state.y = ny;
    enemy.style.left = `${nx * TILE}px`;
    enemy.style.top = `${ny * TILE}px`;
  }
}

// --- Input ---
document.addEventListener("keydown", (e) => {
  state.keys.add(e.key);
  state.moving = true;

  switch (e.key) {
    case "w":
    case "W":
      tryMove(0, -1, DIR.up);
      break;
    case "s":
    case "S":
      tryMove(0, 1, DIR.down);
      break;
    case "a":
    case "A":
      tryMove(-1, 0, DIR.left);
      break;
    case "d":
    case "D":
      tryMove(1, 0, DIR.right);
      break;
  }
});

document.addEventListener("keyup", (e) => {
  state.keys.delete(e.key);
  if (state.keys.size === 0) state.moving = false;
});

// Initial sprite render
applySprite();
