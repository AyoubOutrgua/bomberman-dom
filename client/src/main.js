import {
  hxs,
  mountApp,
  initRouter,
  addRoute,
  startRouter,
  navigateTo,
} from "./lib/framework/index.js";
import { store } from "./lib/state.js";
import { gameLoop, startGameLoop } from "./lib/loop.js";
import { initNetwork } from "./lib/network.js";

import { Login } from "./components/login.js";
import { Lobby } from "./components/Lobby.js";
import { Board } from "./components/Board.js";
import { Chat } from "./components/Chat.js";

initNetwork();
initRouter(store);

window.addEventListener(
  "keydown",
  (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    const gameKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
    if (gameKeys.includes(e.key)) {
      e.preventDefault();
    }
  },
  { passive: false },
);

addRoute("/", () => {
  return { currentView: "login" };
});

addRoute("/lobby", () => {
  if (!store.state.lobby.username) {
    navigateTo("/");
    return;
  }
  if (store.state.game.status === "playing") {
    navigateTo("/map");
    return;
  }
  return { currentView: "lobby" };
});

addRoute("/map", () => {
  if (store.state.game.status !== "playing") {
    navigateTo("/lobby");
    return;
  }
  startGameLoop();
  return { currentView: "map" };
});

addRoute("*", () => {
  return { currentView: "404" };
});

startRouter();

const mainLayout = (content, state) => {
  return hxs(
    "div",
    { id: "main-layout" },
    hxs("div", { class: "content-wrapper" }, content),
    Chat(state),
  );
};

const NotFound = () => {
  return hxs(
    "div",
    { class: "not-found-screen" },
    hxs("h1", { class: "not-found-h1" }, "404"),
    hxs("h2", { class: "not-found-h2" }, "SECTOR NOT FOUND"),
    hxs(
      "p",
      { class: "not-found-desc" },
      "The grid coordinates you are looking for do not exist or have been destroyed in battle.",
    ),
    hxs(
      "button",
      { class: "action-btn", onclick: () => navigateTo("/") },
      "RETURN TO BASE",
    ),
  );
};

const appView = (state) => {
  switch (state.currentView) {
    case "login":
        return Login(state);
    case "lobby":
        return mainLayout(Lobby(state), state);
    case "map":

        setTimeout(() => {
            const wrapper = document.getElementById("board");
            if (wrapper) wrapper.focus();
        }, 0);

        return mainLayout(Board(state), state);
    default:
        return NotFound();
  }
};

const container = document.getElementById("board-container");
if (container) container.innerHTML = "";

mountApp(store, appView, "board-container");
window.dispatchEvent(new Event("hashchange"));
