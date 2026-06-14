import { store } from "../lib/state.js";

let frameCounter = 0;

export function tickBombAnimations() {
  frameCounter++;
  if (frameCounter % 10 !== 0) return;
  frameCounter = 0;

  const bombs = store.state.game?.bombs;
  if (!bombs?.length) return;

  bombs.forEach((b) => {
    b.frame = (b.frame + 1) % 4;
  });
}
