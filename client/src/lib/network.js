import { store } from "./state.js";
import { navigateTo } from "./framework/index.js";
import { createEventManager } from "./framework/index.js";

const { dispatch } = createEventManager(store);

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
    explosions: [],
    items: [],
    stats: {},
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

      switch (data.type) {
        case "JOIN_SUCCESS":
          store.setState({
            lobby: {
              ...store.state.lobby,
              roomId: data.payload.roomId,
              username: data.payload.username,
              myId: data.payload.playerId,
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

        case "PLAYER_LEFT": {
          const disconnectedId = data.payload.playerId;
          const isPlaying = store.state.game.status === "playing";

          // FIX: always update lobby
          const newLobby = {
            ...store.state.lobby,
            players: data.payload.players,
            count: data.payload.count,
          };

          if (isPlaying && disconnectedId) {
            // FIX: remove disconnected player from game state
            const updatedPlayers = { ...store.state.game.players };
            const updatedStats = { ...store.state.game.stats };

            // FIX: remove sprite from board
            delete updatedPlayers[disconnectedId];
            // FIX: remove stats from HUD
            delete updatedStats[disconnectedId];

            store.setState({
              lobby: newLobby,
              game: {
                ...store.state.game,
                players: updatedPlayers,
                stats: updatedStats,
              },
            });
          } else {
            store.setState({ lobby: newLobby });
          }
          break;
        }

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
          const initialStats = {};

          if (data.payload?.players) {
            data.payload.players.forEach((player) => {
              newPlayers[player.id] = {
                username: player.username || "Player",
                x: player.x || 48,
                y: player.y || 48,
                direction: "ArrowDown",
                isMoving: false,
                frame: 0,
                speed: 1.5,
                isDead: false,
                lives: 3,
              };

              initialStats[player.id] = {
                lives: 3,
                score: 0,
                maxBombs: 1,
                activeBombs: 0,
                blastRadius: 1,
                speed: 1.5,
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
              explosions: [],
              items: [],
              stats: initialStats,
            },
          });
          navigateTo("/map");
          break;
        }

        case "PLAYER_MOVED": {
          const playerId = data.payload.id;
          const currentPlayer = store.state.game.players[playerId];

          if (!currentPlayer) break;

          store.setState({
            game: {
              ...store.state.game,
              players: {
                ...store.state.game.players,
                [playerId]: {
                  ...currentPlayer,
                  x: data.payload.x,
                  y: data.payload.y,
                  direction: data.payload.direction,
                  isMoving: data.payload.isMoving,
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
                  frame: 0,
                  ownerId: data.payload.ownerId,
                },
              ],
            },
          });
          break;

        case "BOMB_EXPLODED": {
          dispatch("APPLY_EXPLOSION", data.payload);
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
                  // FIX: also set lives to 0 and stop movement
                  lives: 0,
                  isMoving: false,
                },
              },
              stats: {
                ...store.state.game.stats,
                [id]: {
                  ...store.state.game.stats[id],
                  lives: 0,
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

        case "PLAYER_HIT": {
          const hitId = data.payload.playerId;
          if (!store.state.game.stats[hitId]) break;
          if (!store.state.game.players[hitId]) break;

          store.setState({
            game: {
              ...store.state.game,
              // FIX: update stats
              stats: {
                ...store.state.game.stats,
                [hitId]: {
                  ...store.state.game.stats[hitId],
                  lives: data.payload.livesLeft,
                },
              },
              // FIX: also sync lives inside players to stay consistent
              players: {
                ...store.state.game.players,
                [hitId]: {
                  ...store.state.game.players[hitId],
                  lives: data.payload.livesLeft,
                },
              },
            },
          });
          break;
        }

        case "ITEM_COLLECTED": {
          dispatch("COLLECT_ITEM", {
            itemId: data.payload.itemId,
            playerId: data.payload.playerId,
            itemType: data.payload.itemType,
          });

          store.setState({
            game: {
              ...store.state.game,
              stats: {
                ...store.state.game.stats,
                [data.payload.playerId]: {
                  ...store.state.game.stats[data.payload.playerId],
                  ...data.payload.newStats,
                },
              },
            },
          });
          break;
        }

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

    const currentPath = window.location.pathname;
    if (currentPath === "/lobby" || currentPath === "/map") {
      navigateTo("/");
    }
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

export const sendPlayerMove = (direction) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "PLAYER_MOVED", payload: { direction } }));
  }
};

export const sendPlaceBomb = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "PLACE_BOMB", payload: {} }));
  }
};
