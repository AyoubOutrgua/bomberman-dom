import { store } from "./state.js";
import { FRAMES } from "../../../shared/constants.js";
import { sendPlayerMove } from "../lib/network.js";

export const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};
// TASK 4: Import Bomb Animator for Combat ticks
import { tickBombAnimations } from "../components/BombAnimator.js";

let isRunning = false;
let lastSentDir = "none";

let startTime = null;
let timerDOM = null;
let lastSeconds = -1;

export const startGameLoop = () => {
  if (isRunning) return;
  isRunning = true;
  startTime = Date.now();
  requestAnimationFrame(gameLoop);
};

export const gameLoop = () => {
  if (store.state.game.status === "finished") return;
  const myId = store.state.lobby.myId;
  const players = store.state.game.players;

  if (!players) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const p = players[myId];
  if (p && !p.isDead) {
    let currentDir = "none";
    let isMoving = false;

    if (keys.ArrowUp) {
      currentDir = "ArrowUp";
      isMoving = true;
    } else if (keys.ArrowDown) {
      currentDir = "ArrowDown";
      isMoving = true;
    } else if (keys.ArrowLeft) {
      currentDir = "ArrowLeft";
      isMoving = true;
    } else if (keys.ArrowRight) {
      currentDir = "ArrowRight";
      isMoving = true;
    }

    if (currentDir !== "none") {
      sendPlayerMove(currentDir);
    } else if (lastSentDir !== "none") {
      sendPlayerMove("none");
    }
    lastSentDir = currentDir;

    if (isMoving) {
      p.frameCounter = (p.frameCounter || 0) + 1;
      if (p.frameCounter > 5) {
        p.frame = (p.frame + 1) % FRAMES[currentDir].cols;
        p.frameCounter = 0;
      }
      p.direction = currentDir;
    } else {
      if (p.frame !== 0) p.frame = 0;
    }
  }

  for (const id in players) {
    if (id === myId) continue;

    const enemy = players[id];
    if (enemy.isMoving) {
      enemy.frameCounter = (enemy.frameCounter || 0) + 1;
      if (enemy.frameCounter > 5) {
        enemy.frame = (enemy.frame + 1) % FRAMES[enemy.direction].cols;
        enemy.frameCounter = 0;
      }
    } else {
      if (enemy.frame !== 0) enemy.frame = 0;
    }
  }

  if (!timerDOM) {
    timerDOM = document.getElementById("game-timer-display");
  }
  if (timerDOM && startTime) {
    const elapsed = Date.now() - startTime;
    const totalSeconds = Math.floor(elapsed / 1000);

    if (totalSeconds !== lastSeconds) {
      const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (totalSeconds % 60).toString().padStart(2, "0");
      timerDOM.innerText = `${minutes}:${seconds}`;
      lastSeconds = totalSeconds;
    }

    timerDOM.style.opacity = timerDOM.style.opacity === "1" ? "0.99" : "1";
  }

  // TASK 4: Tick combat animations and explosions at 60FPS in-place (No VDOM spam)
  tickBombAnimations();

  const explosions = store.state.game?.explosions;
  let explosionsChanged = false;

  if (explosions?.length) {
    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].ttl -= 16;

      explosions[i].frameCounter = (explosions[i].frameCounter || 0) + 16;
      if (explosions[i].frameCounter >= 85) {
        const nextFrame = Math.min((explosions[i].frame || 0) + 1, 6);

        if (nextFrame !== (explosions[i].frame || 0)) {
          explosions[i].frame = nextFrame;
          explosionsChanged = true;
        }

        explosions[i].frameCounter = 0;
      }

      if (explosions[i].ttl <= 0) {
        explosions.splice(i, 1);
        explosionsChanged = true;
      }
    }

    if (explosionsChanged) {
      store.setState({
        game: {
          ...store.state.game,
          explosions: [...explosions],
        },
      });
    }
  }

  requestAnimationFrame(gameLoop);
};
