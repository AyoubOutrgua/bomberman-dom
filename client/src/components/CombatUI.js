import { hxs } from "../lib/framework/index.js";

export const CombatUI = (state) => {
  const myId = state.lobby?.myId;
  const stats = state.game?.stats || {};
  const players = state.game?.players || {};
  const status = state.game?.status;

  const myStats = stats[myId] || {};
  const myPlayer = players[myId] || {};

  const lives = myStats.lives ?? myPlayer.lives ?? 3;
  const maxBombs = myStats.maxBombs ?? 1;
  const blastRadius = myStats.blastRadius ?? 1;
  const speed = myStats.speed ?? 1.5;

  const livesIndicators = [];
  for (let i = 0; i < 3; i++) {
    livesIndicators.push(
      hxs("span", {
        class: `hud-heart ${i < lives ? "hud-heart-active" : "hud-heart-empty"}`,
      }),
    );
  }

  const overlay =
    status === "finished"
      ? hxs(
          "div",
          { class: "overlay-game-over" },
          hxs("h1", {}, "GAME OVER"),
          hxs(
            "p",
            {},
            state.game.winnerId
              ? `Winner: ${players[state.game.winnerId]?.username ?? "Unknown"}`
              : "Draw!",
          ),
          hxs(
            "button",
            {
              class: "action-btn",
              onclick: () => window.location.reload(),
            },
            "PLAY AGAIN",
          ),
        )
      : null;

  return hxs(
    "div",
    { id: "combat-ui" },
    hxs(
      "div",
      { class: "hud-bar" },

      // HP
      hxs(
        "div",
        { class: "hud-stat" },
        hxs("span", { class: "hud-stat-label" }, "HP"),
        hxs("div", { class: "hud-hearts" }, ...livesIndicators),
      ),

      // Bombs
      hxs(
        "div",
        { class: "hud-stat" },
        hxs("span", { class: "hud-sprite-icon hud-sprite-bomb" }),
        hxs("span", { class: "hud-stat-value" }, `×${maxBombs}`),
      ),

      // Blast
      hxs(
        "div",
        { class: "hud-stat" },
        hxs("span", { class: "hud-sprite-icon hud-sprite-flame" }),
        hxs("span", { class: "hud-stat-value" }, `×${blastRadius}`),
      ),

      // Speed
      hxs(
        "div",
        { class: "hud-stat" },
        hxs("span", { class: "hud-sprite-icon hud-sprite-speed" }),
        hxs("span", { class: "hud-stat-value" }, `×${speed.toFixed(1)}`),
      ),

      // Timer
      hxs("div", { id: "game-timer-display", class: "hud-timer" }, "00:00"),
    ),
    overlay,
  );
};
