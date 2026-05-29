import { hxs } from "../lib/framework/index.js";
import { sendChatMessage } from "../lib/network.js";

const sendMessage = () => {
  const input = document.getElementById("chat-input");
  if (input && input.value.trim() !== "") {
    sendChatMessage(input.value.trim());
    input.value = "";
  }
};

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    const messages = document.getElementById("chat-messages");
    if (messages) {
      messages.scrollTop = messages.scrollHeight;
    }
  });
};

export const Chat = (state) => {
  scrollToBottom();

  return hxs(
    "div",
    { id: "chat-sidebar" },
    hxs(
      "div",
      { class: "chat-header" },
      hxs("h3", { class: "chat-h3" }, "> COMM_LINK"),
    ),
    hxs(
      "div",
      { id: "chat-messages" },
      ...state.chat.map((msg, i) =>
        hxs(
          "div",
          { key: i, class: "chat-msg" },
          hxs("span", { class: "chat-username" }, `[${msg.username}]`),
          hxs("span", { class: "chat-text" }, msg.text),
        ),
      ),
    ),
    hxs(
      "div",
      { class: "chat-input-area" },
      hxs("input", {
        id: "chat-input",
        type: "text",
        placeholder: "Transmit data...",
        onkeydown: (e) => {
          if (e.key === "Enter") sendMessage();
        },
      }),
      hxs("button", { class: "chat-btn", onclick: sendMessage }, "SEND"),
    ),
  );
};
