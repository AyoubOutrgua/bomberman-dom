// /client/src/main.js

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
const TILE = 48;

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
   ENTITY LAYER — PLAYER
   =========================== */
const player = document.createElement("div");
player.classList.add("entity", "enemy-zombie");
player.style.left = `${1 * TILE}px`;
player.style.top = `${1 * TILE}px`;
board.appendChild(player);

/* ===========================
   PLAYER ANIMATION CONSTANTS
   =========================== */
const SCALE = 0.75;
const FRAME_W = 64 * SCALE; // 48
const FRAME_H = 64 * SCALE; // 48
const PLAYER_FRAMES = 9;
const PLAYER_FPS = 10;

const DIR = { up: 0, left: 1, down: 2, right: 3 };

/* ===========================
   BOMB CONSTANTS
   bomb.png = 64×16 → 4 frames × 16×16
   scaled 2x → 4 frames × 32×32
   =========================== */
const BOMB_FRAMES = 4;
const BOMB_FRAME_W = 32; // 16px × 2x scale
const BOMB_FPS = 4;
const BOMB_TIMER = 3000;

/* ===========================
   EXPLOSION CONSTANTS
   fire.png = 112×16 → 7 frames × 16×16
   scaled 3x → 7 frames × 48×48
   =========================== */
const EXPLOSION_FRAMES = 7;
const EXPLOSION_FRAME_W = 48; // 16px × 3x scale
const EXPLOSION_FPS = 14;
const EXPLOSION_DURATION = 500;
const BLAST_RADIUS = 1;

/* ===========================
   GAME STATE
   =========================== */
const state = {
  x: 1,
  y: 1,
  dir: 2,
  frame: 0,
  moving: false,
  keys: new Set(),
  bombActive: false,
};

/* ===========================
   PLAYER ANIMATION LOOP
   =========================== */
setInterval(() => {
  if (state.moving) {
    state.frame = (state.frame + 1) % PLAYER_FRAMES;
  } else {
    state.frame = 0;
  }
  applyPlayerSprite();
}, 1000 / PLAYER_FPS);

function applyPlayerSprite() {
  const ox = -(state.frame * FRAME_W);
  const oy = -(state.dir * FRAME_H);
  player.style.backgroundPosition = `${ox}px ${oy}px`;
}

/* ===========================
   PLAYER MOVEMENT
   =========================== */
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
    player.style.left = `${nx * TILE}px`;
    player.style.top = `${ny * TILE}px`;
  }
}

/* ===========================
   BOMB — PLACE
   =========================== */
function placeBomb(gridX, gridY) {
  if (state.bombActive) return;
  state.bombActive = true;

  const bomb = document.createElement("div");
  bomb.classList.add("entity-bomb");
  // Center 32px bomb inside 48px tile → offset 8px
  bomb.style.left = `${gridX * TILE + 8}px`;
  bomb.style.top = `${gridY * TILE + 8}px`;
  board.appendChild(bomb);

  // --- Bomb pulsing animation (4 frames × 32px) ---
  let bombFrame = 0;
  const bombAnim = setInterval(() => {
    bombFrame = (bombFrame + 1) % BOMB_FRAMES;
    bomb.style.backgroundPosition = `${-(bombFrame * BOMB_FRAME_W)}px 0px`;
  }, 1000 / BOMB_FPS);

  // --- Fuse timer → explode after 3 seconds ---
  setTimeout(() => {
    clearInterval(bombAnim);
    bomb.remove();
    explode(gridX, gridY);
  }, BOMB_TIMER);
}

/* ===========================
   BOMB — EXPLODE
   =========================== */
function explode(centerX, centerY) {
  // --- Build explosion tiles: center + 4 directions ---
  const explosionTiles = [{ x: centerX, y: centerY }];

  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
  ];

  directions.forEach(({ dx, dy }) => {
    for (let i = 1; i <= BLAST_RADIUS; i++) {
      explosionTiles.push({
        x: centerX + dx * i,
        y: centerY + dy * i,
      });
    }
  });

  // --- Create explosion elements ---
  const explosionElements = [];

  explosionTiles.forEach(({ x, y }) => {
    const explosion = document.createElement("div");
    explosion.classList.add("entity-explosion");
    explosion.style.left = `${x * TILE}px`;
    explosion.style.top = `${y * TILE}px`;
    board.appendChild(explosion);
    explosionElements.push(explosion);
  });

  // --- Animate fire (7 frames × 48px) ---
  let frame = 0;
  const explosionAnim = setInterval(() => {
    frame++;

    if (frame >= EXPLOSION_FRAMES) {
      clearInterval(explosionAnim);
      cleanup();
      return;
    }

    explosionElements.forEach((el) => {
      el.style.backgroundPosition = `${-(frame * EXPLOSION_FRAME_W)}px 0px`;
    });
  }, 1000 / EXPLOSION_FPS);

  // --- Safety timeout cleanup ---
  const safetyTimer = setTimeout(() => {
    clearInterval(explosionAnim);
    cleanup();
  }, EXPLOSION_DURATION);

  function cleanup() {
    clearTimeout(safetyTimer);
    explosionElements.forEach((el) => {
      if (el.parentNode) el.remove();
    });
    state.bombActive = false;
  }
}

/* ===========================
   INPUT HANDLING
   =========================== */
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
    case " ":
      e.preventDefault();
      placeBomb(state.x, state.y);
      break;
  }
});

document.addEventListener("keyup", (e) => {
  state.keys.delete(e.key);
  if (state.keys.size === 0) state.moving = false;
});

// --- Initial render ---
applyPlayerSprite();
