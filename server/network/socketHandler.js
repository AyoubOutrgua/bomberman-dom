import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { handleChatMessage } from "./chatController.js";
import { generateMap } from "../game/MapGenerator.js";
import { SPAWNS, TILE_SIZE } from "../../shared/constants.js";

export const gameEvents = new EventEmitter();
const rooms = new Map();

gameEvents.on("PLAYER_DEAD", (playerId, roomId) => {
  broadcastToRoom(roomId, {
    type: "PLAYER_DEAD",
    payload: { playerId },
  });
});

gameEvents.on("GAME_OVER", (roomId, winnerId) => {
  broadcastToRoom(roomId, {
    type: "GAME_OVER",
    payload: { winnerId },
  });
});

export function broadcastToRoom(roomId, messageData) {
  const room = rooms.get(roomId);
  if (room) {
    const stringMessage = JSON.stringify(messageData);
    for (const player of room.players) {
      if (player.socket.readyState === 1) {
        player.socket.send(stringMessage);
      }
    }
  }
}

function createRoom() {
  const newRoom = {
    id: randomUUID(),
    players: [],
    status: "waiting",
    timer: null,
    timeLeft: 0,
    phase: "waiting",
  };
  rooms.set(newRoom.id, newRoom);
  return newRoom;
}

function findAvailableRoom() {
  for (const room of rooms.values()) {
    if (room.status === "waiting" && room.players.length < 4) {
      return room;
    }
  }
  return null;
}

function cleanRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }
  rooms.delete(roomId);
}

function joinPlayer(ws, username) {
  const trimmed = username ? username.trim() : "";
  const sanitized = trimmed.replace(/[<>"'&]/g, "");

  if (!sanitized || sanitized.length === 0 || sanitized.length > 15) {
    ws.send(
      JSON.stringify({
        type: "JOIN_ERROR",
        payload: {
          message: "Invalid username! (1-15 characters, no special chars)",
        },
      }),
    );
    return;
  }

  let room = findAvailableRoom();
  if (!room) {
    room = createRoom();
  }

  const isTaken = room.players.some((p) => p.username === sanitized);
  if (isTaken) {
    ws.send(
      JSON.stringify({
        type: "JOIN_ERROR",
        payload: { message: "Username is already taken in this room!" },
      }),
    );
    return;
  }

  const player = { id: randomUUID(), socket: ws, username: sanitized };
  room.players.push(player);

  ws.roomId = room.id;
  ws.playerId = player.id;
  ws.username = sanitized;

  ws.send(
    JSON.stringify({
      type: "JOIN_SUCCESS",
      payload: { roomId: room.id, username: sanitized, playerId: player.id },
    }),
  );

  broadcastToRoom(room.id, {
    type: "PLAYER_COUNT",
    payload: {
      count: room.players.length,
      players: room.players.map((p) => p.username),
    },
  });

  handleRoomTimer(room.id);
}

function scheduleNextTick(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.status === "playing" || room.status === "finished") return;

  room.timer = setTimeout(() => {
    const r = rooms.get(roomId);
    if (!r) return;

    r.timeLeft--;

    broadcastToRoom(roomId, {
      type: "TIMER_UPDATE",
      payload: { timeLeft: r.timeLeft, phase: r.phase },
    });

    if (r.timeLeft <= 0) {
      if (r.phase === "soft_countdown") {
        r.phase = "locked_countdown";
        r.status = "locked";
        r.timeLeft = 1;
        scheduleNextTick(roomId);
      } else if (r.phase === "locked_countdown") {
        r.timer = null;
        startGame(roomId);
      }
    } else {
      scheduleNextTick(roomId);
    }
  }, 1000);
}

export let BASE_MAP;

function startGame(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  BASE_MAP = generateMap();

  room.status = "playing";

  const playersList = room.players.map((p, index) => {
    const spawn = SPAWNS[index] || SPAWNS[0];
    return {
      id: p.id,
      username: p.username,
      x: spawn.col * TILE_SIZE,
      y: spawn.row * TILE_SIZE,
    };
  });

  broadcastToRoom(roomId, {
    type: "START_GAME",
    payload: { map: BASE_MAP, players: playersList },
  });

  gameEvents.emit("GAME_STARTED", room.id, playersList);
}

function handleRoomTimer(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.players.length < 2) {
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }
    room.status = "waiting";
    room.phase = "waiting";
    room.timeLeft = 0;
    broadcastToRoom(roomId, { type: "TIMER_STOP" });
    return;
  }

  if (room.players.length === 4 && room.phase === "soft_countdown") {
    if (room.timer) {
      clearTimeout(room.timer);
      room.timer = null;
    }
    room.phase = "locked_countdown";
    room.status = "locked";
    room.timeLeft = 1;
    broadcastToRoom(roomId, {
      type: "TIMER_UPDATE",
      payload: { timeLeft: room.timeLeft, phase: room.phase },
    });
    scheduleNextTick(roomId);
    return;
  }

  if (room.players.length >= 2 && !room.timer) {
    room.phase = "soft_countdown";
    room.status = "waiting";
    room.timeLeft = 2;
    scheduleNextTick(roomId);
  }
}

export function setupSockets(webs) {
  webs.on("connection", (ws) => {
    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case "JOIN_ROOM":
            joinPlayer(ws, data.payload?.username);
            break;

          case "CHAT_MESSAGE":
            handleChatMessage(ws, data.payload, broadcastToRoom);
            break;

          case "PLAYER_MOVED":
            if (ws.roomId && ws.playerId) {
              const room = rooms.get(ws.roomId);
              if (room?.status === "playing") {
                gameEvents.emit(
                  "PLAYER_MOVED",
                  ws.playerId,
                  ws.roomId,
                  data.payload,
                );
              }
            }
            break;

          case "PLACE_BOMB":
            if (ws.roomId && ws.playerId) {
              const room = rooms.get(ws.roomId);
              if (room?.status === "playing") {
                gameEvents.emit(
                  "BOMB_PLACED",
                  ws.playerId,
                  ws.roomId,
                  data.payload,
                );
              }
            }
            break;

          default:
            console.warn(`[Socket] Unknown message type: ${data.type}`);
        }
      } catch (error) {
        console.warn(
          `[Socket] Invalid message from [${ws.username || "unknown"}]:`,
          error.message,
        );
      }
    });

    ws.on("close", () => {
      if (!ws.roomId || !ws.playerId) return;

      const room = rooms.get(ws.roomId);
      if (!room) return;

      room.players = room.players.filter((p) => p.id !== ws.playerId);

      if (room.players.length === 0) {
        cleanRoom(room.id);
        return;
      }

      if (room.timer) {
        clearTimeout(room.timer);
        room.timer = null;
      }

      if (room.status === "playing") {
        broadcastToRoom(room.id, {
          type: "PLAYER_LEFT",
          payload: {
            count: room.players.length,
            players: room.players.map((p) => p.username),
          },
        });

        gameEvents.emit("PLAYER_DISCONNECTED", ws.playerId, room.id);

        return;
      }

      broadcastToRoom(room.id, {
        type: "PLAYER_COUNT",
        payload: {
          count: room.players.length,
          players: room.players.map((p) => p.username),
        },
      });

      handleRoomTimer(room.id);
    });
  });
}
