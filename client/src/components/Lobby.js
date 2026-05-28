import { hxs } from "../lib/framework/index.js";

export const Lobby = (state) => {
  const { roomId, players, count, timeLeft, phase } = state.lobby;

  return hxs(
    "div",
    { id: "lobby-screen" },
    hxs(
      "div",
      { class: "lobby-header" },
      hxs("h1", { class: "lobby-h1" }, "LOBBY"),
      hxs("h2", { class: "lobby-h2" }, `ROOM_ID: ${roomId || "Loading..."}`),
    ),
    hxs(
      "div",
      { class: "lobby-section" },
      hxs("h3", { class: "lobby-h3" }, `> PLAYERS_ONLINE [${count}/4]`),
      hxs(
        "ul",
        { class: "players-list" },
        ...(players && players.length > 0
          ? players.map((p) => hxs("li", { class: "player-item" }, `● ${p}`))
          : [hxs("li", { class: "player-empty" }, "Awaiting connections...")]),
      ),
    ),
    hxs(
      "div",
      { class: "lobby-panels" },
      hxs(
        "div",
        { class: "control-panel" },
        hxs("h3", { class: "lobby-h3" }, "> CONTROLS"),
        hxs(
          "div",
          { class: "controls-list" },
          hxs(
            "div",
            { class: "control-item" },
            hxs("span", { class: "control-key" }, "ARROWS"),
            hxs("span", { class: "control-desc" }, "Navigate the grid"),
          ),
          hxs(
            "div",
            { class: "control-item" },
            hxs("span", { class: "control-key" }, "SPACE"),
            hxs("span", { class: "control-desc" }, "Deploy bomb"),
          ),
        ),
      ),
      hxs(
        "div",
        { class: "status-panel" },
        hxs("h3", { class: "lobby-h3" }, "> SYSTEM_STATUS"),
        phase === "waiting"
          ? hxs("p", { class: "status-waiting" }, "Waiting for players...")
          : hxs(
              "div",
              {},
              hxs(
                "p",
                { class: "status-label" },
                phase === "locked_countdown"
                  ? "Match locked. Initiating in:"
                  : "Soft countdown:",
              ),
              hxs("p", { class: "status-timer" }, `${timeLeft}s`),
            ),
      ),
    ),
  );
};
