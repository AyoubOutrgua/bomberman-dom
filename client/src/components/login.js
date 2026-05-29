import { hxs } from "../lib/framework/index.js";
import { sendJoinRoom } from "../lib/network.js";

export const Login = (state) => {
  const join = () => {
    const input = document.getElementById("username-input");
    const username = input ? input.value.trim() : "";
    if (username !== "") sendJoinRoom(username);
  };

  return hxs(
    "div",
    { id: "login-screen" },
    hxs(
      "div",
      { class: "login-header" },
      hxs("h1", { class: "login-h1" }, "BOMBERMAN"),
      hxs("h2", { class: "login-h2" }, "PACKET DROP"),
    ),
    hxs(
      "div",
      { class: "login-card" },
      hxs(
        "p",
        { class: "login-desc" },
        "Enter the grid. Destroy the walls. Survive.",
      ),
      hxs("input", {
        id: "username-input",
        class: "login-input",
        type: "text",
        placeholder: "Enter Warrior Name...",
        onkeydown: (e) => {
          if (e.key === "Enter") join();
        },
      }),
      hxs(
        "button",
        { class: "action-btn login-btn", onclick: join },
        "JOIN GAME",
      ),
      state.lobby.error
        ? hxs("p", { class: "login-error" }, state.lobby.error)
        : null,
      hxs(
        "div",
        { class: "login-features" },
        hxs(
          "div",
          { class: "feature-item" },
          hxs("span", { class: "feature-icon" }, "💣"),
          hxs("span", { class: "feature-text" }, "Place Bombs"),
        ),
        hxs(
          "div",
          { class: "feature-item" },
          hxs("span", { class: "feature-icon" }, "💥"),
          hxs("span", { class: "feature-text" }, "Destroy Walls"),
        ),
        hxs(
          "div",
          { class: "feature-item" },
          hxs("span", { class: "feature-icon" }, "🏆"),
          hxs("span", { class: "feature-text" }, "Last Standing"),
        ),
      ),
    ),
  );
};
