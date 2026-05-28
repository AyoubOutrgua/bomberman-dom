import { store } from "./state.js";
import { navigateTo } from "./framework/index.js";

export let ws = null;

const INITIAL_STATE = {
  lobby: {
    roomId: null,
    username: null,
    players: [],
    count: 0,
    timeLeft: 0,
    error: null,
    phase: "waiting",
  },
  chat: [],
  game: {
    status: "waiting",
    map: [],
    players: {},
    bombs: [],
    startTime: null,
  },
};

export const initNetwork = () => {
  store.setState(INITIAL_STATE);

  ws = new WebSocket("ws://localhost:3000");

  ws.onopen = () => {
    console.log("[Network] 🟢 WebSocket Connected successfully!");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("[Network] Received:", data.type, data.payload || "");

      switch (data.type) {
        case "JOIN_SUCCESS":
          store.setState({
            lobby: {
              ...store.state.lobby,
              roomId: data.payload.roomId,
              username: data.payload.username,
              error: null,
            },
          });
          navigateTo("/lobby");
          break;

        case "JOIN_ERROR":
          store.setState({
            lobby: {
              ...store.state.lobby,
              error: data.payload.message,
            },
          });
          console.error("[Network] Join Error:", data.payload.message);
          break;

        case "PLAYER_COUNT":
          store.setState({
            lobby: {
              ...store.state.lobby,
              players: data.payload.players,
              count: data.payload.count,
            },
          });
          break;

        case "TIMER_UPDATE":
          store.setState({
            lobby: {
              ...store.state.lobby,
              timeLeft: data.payload.timeLeft,
              phase: data.payload.phase,
            },
          });
          break;

        case "TIMER_STOP":
          store.setState({
            lobby: {
              ...store.state.lobby,
              phase: "waiting",
              timeLeft: 0,
            },
          });
          break;

        case "PLAYER_LEFT":
          store.setState({
            lobby: {
              ...store.state.lobby,
              players: data.payload.players,
              count: data.payload.count,
            },
          });
          break;

        case "CHAT_MESSAGE":
          store.setState({
            chat: [
              ...store.state.chat,
              {
                username: data.payload.username,
                text: data.payload.text,
              },
            ],
          });
          break;

        case "START_GAME": {
          const newPlayers = {};
          if (data.payload?.players) {
            data.payload.players.forEach((player) => {
              newPlayers[player.id] = {
                username: player.username || "Player",
                x: player.x || 48,
                y: player.y || 48,
                direction: "ArrowDown",
                frame: 0,
                isDead: false,
                lives: 3,
              };
            });
          }

          store.setState({
            game: {
              ...store.state.game,
              status: "playing",
              startTime: Date.now(),
              map: data.payload?.map || store.state.map || [],
              players: newPlayers,
              bombs: [],
            },
          });
          navigateTo("/map");
          break;
        }

        case "PLAYER_MOVED": {
          const playerId = data.payload.id;
          if (!store.state.game.players[playerId]) break;

          store.setState({
            game: {
              ...store.state.game,
              players: {
                ...store.state.game.players,
                [playerId]: {
                  ...store.state.game.players[playerId],
                  x: data.payload.x,
                  y: data.payload.y,
                  direction: data.payload.direction,
                },
              },
            },
          });
          break;
        }

        case "BOMB_PLACED":
          store.setState({
            game: {
              ...store.state.game,
              bombs: [
                ...store.state.game.bombs,
                {
                  id: data.payload.bombId,
                  x: data.payload.x,
                  y: data.payload.y,
                },
              ],
            },
          });
          break;

        case "BOMB_EXPLODED": {
          const remainingBombs = store.state.game.bombs.filter(
            (bomb) => bomb.id !== data.payload.bombId,
          );

          let updatedMap = store.state.game.map;
          if (data.payload.destroyedWalls?.length > 0) {
            updatedMap = store.state.game.map.map((row) => [...row]);
            data.payload.destroyedWalls.forEach((wall) => {
              updatedMap[wall.row][wall.col] = 0;
            });
          }

          let updatedPlayers = store.state.game.players;
          if (data.payload.deadPlayers?.length > 0) {
            updatedPlayers = { ...store.state.game.players };
            data.payload.deadPlayers.forEach((playerId) => {
              if (updatedPlayers[playerId]) {
                updatedPlayers[playerId] = {
                  ...updatedPlayers[playerId],
                  isDead: true,
                };
              }
            });
          }

          store.setState({
            game: {
              ...store.state.game,
              bombs: remainingBombs,
              map: updatedMap,
              players: updatedPlayers,
            },
          });
          break;
        }

        case "PLAYER_DEAD": {
          const id = data.payload.playerId;
          if (!store.state.game.players[id]) break;

          store.setState({
            game: {
              ...store.state.game,
              players: {
                ...store.state.game.players,
                [id]: {
                  ...store.state.game.players[id],
                  isDead: true,
                },
              },
            },
          });
          break;
        }

        case "GAME_OVER":
          store.setState({
            game: {
              ...store.state.game,
              status: "finished",
              winnerId: data.payload.winnerId,
            },
          });
          break;

        default:
          console.warn("[Network] Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("[Network] Error parsing message:", error);
    }
  };

  ws.onclose = () => {
    console.log("[Network] Connection closed by the server.");
    store.setState(INITIAL_STATE);
    navigateTo("/");
  };

  ws.onerror = (error) => {
    console.error("[Network] WebSocket error:", error);
  };
};

export const sendJoinRoom = (username) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "JOIN_ROOM", payload: { username } }));
  }
};

export const sendChatMessage = (text) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "CHAT_MESSAGE", payload: { text } }));
  }
};

export const sendPlayerMove = (x, y, direction) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "MOVE", payload: { x, y, direction } }));
  }
};

export const sendPlaceBomb = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "PLACE_BOMB", payload: {} }));
  }
};
