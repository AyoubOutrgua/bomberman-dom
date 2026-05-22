# Bomberman DOM — Tasks Breakdown

---

## Task 1: Lobby & Chat

**Backend — `@member_1`**
| File | Role |
|------|------|
| `server/index.js` | HTTP + WebSocket bootstrap, serves static files |
| `server/network/socketHandler.js` | Connection lifecycle, message routing, broadcast |
| `server/network/chatController.js` | Chat validation, rate limiting, timestamp + broadcast |
| `shared/events.js` | WS event name constants (JOIN, LEAVE, READY, CHAT_MSG, etc.) |

**Frontend — `@member_2`**
| File | Role |
|------|------|
| `client/src/lib/network.js` | WS client singleton, send/receive, dispatch to store |
| `client/src/lib/framework/router.js` | Hash-based routing (lobby → game) |
| `client/src/components/Lobby.js` | Nickname input, player list, ready state, countdown |
| `client/src/components/Chat.js` | Scrollable chat list + input, auto-scroll |
| `client/assets/styles/lobby.css` | Lobby + HUD styling |

---

## Task 2: Map Generation

**Backend — `@member_1`**
| File | Role |
|------|------|
| `server/game/MapGenerator.js` | 15×13 grid: checkerboard walls, random bricks, 4 spawn safe zones |
| `shared/constants.js` | Grid size, tile dimensions, map constants |

**Frontend — `@member_2`**
| File | Role |
|------|------|
| `client/src/components/Board.js` | Map rendering from grid data, tile layers, bomb/explosion children |
| `client/src/lib/framework/dom.js` | Virtual DOM `hxs()`, `render()`, `diff()` engine |
| `client/src/lib/framework/state.js` | Reactive `Store` with deep proxy change detection |
| `client/src/lib/framework/events.js` | Action dispatch batching |
| `client/src/lib/framework/index.js` | `mountApp()` — wires store → view → render loop |
| `client/assets/styles/map.css` | Grid layout, tiles, overlays |
| `client/assets/sprites/tiles/` | Floor, wall, brick sprites |

---

## Task 3: Movement & Physics

**Backend — `@member_1`**
| File | Role |
|------|------|
| `server/game/GameEngine.js` | State machine (lobby → countdown → active → round-end), move validation, collision |
| `server/game/Player.js` | Player model (pos, lives, speed, power-up inventory) |

**Frontend — `@member_2`**
| File | Role |
|------|------|
| `client/src/components/PlayerEntity.js` | Sprite rendering, walk/death anim, smooth tile transitions |
| `client/src/lib/loop.js` | `requestAnimationFrame` 60fps loop, input polling, delta-time |
| `client/src/lib/state.js` | Client state: phase, player list, positions, input buffer |

---

## Task 4: Weapons & Stats

**Backend — `@member_1`**
| File | Role |
|------|------|
| `server/game/Bomb.js` | Bomb model (timer, blast radius, chain detonation, brick destruction, player damage) |

**Frontend — `@member_2`**
| File | Role |
|------|------|
| `client/src/components/CombatUI.js` | HUD: lives, power-up indicators, round timer, death/victory overlays |
| `client/src/main.js` | Entry: board init, player entity, bomb placement, explosion anim, input handling |
| `client/index.html` | DOM shell: HUD, board container, overlays |
| `client/assets/styles/entities.css` | Player skins, bomb, explosion, power-up item styles |
| `client/assets/sprites/entities/` | Player (red/blue/black/white) + skeleton/zombie spritesheets |
| `client/assets/sprites/items/` | Bomb, fire, power-up item sprites |

---

## Full Tree

```
bomberman-dom/
├── TASKS.md                           ← this file
├── package.json                       ← project manifest
├── README.md
│
├── client/
│   ├── index.html                     ← DOM shell: HUD, board, overlays
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── entities/              ← player & enemy spritesheets
│   │   │   │   ├── player-red.png
│   │   │   │   ├── player-blue.png
│   │   │   │   ├── player-black.png
│   │   │   │   ├── player-white.png
│   │   │   │   ├── player-*-hurt.png
│   │   │   │   ├── skeleton.png
│   │   │   │   ├── zombie.png
│   │   │   │   └── *.json             ← spritesheet metadata
│   │   │   ├── items/                 ← bomb, fire, power-up sprites
│   │   │   │   ├── bomb.png
│   │   │   │   ├── fire.png
│   │   │   │   ├── item-extra-bomb.png
│   │   │   │   ├── item-blast-radius.png
│   │   │   │   └── item-speed-increase.png
│   │   │   └── tiles/                 ← tile sprites
│   │   │       ├── tile-floor.png
│   │   │       ├── tile-wall.png
│   │   │       ├── tile-brick.png
│   │   │       └── tile-brick-destroy.png
│   │   └── styles/
│   │       ├── lobby.css              ← lobby + HUD styles
│   │       ├── map.css                ← grid layout, tiles, overlays
│   │       └── entities.css           ← player/bomb/explosion/item skins
│   │
│   └── src/
│       ├── main.js                    ← entry: board init, player, bombs, input
│       ├── components/
│       │   ├── Board.js               ← map renderer, bomb/explosion entities
│       │   ├── Chat.js                ← chat UI (messages + input)
│       │   ├── CombatUI.js            ← HUD: lives, power-ups, round timer, overlays
│       │   ├── Lobby.js               ← pre-game: nickname, player list, ready, countdown
│       │   └── PlayerEntity.js        ← player sprite + animation
│       └── lib/
│           ├── loop.js                ← 60fps RAF game loop
│           ├── network.js             ← WS client singleton
│           ├── state.js               ← reactive client store
│           └── framework/
│               ├── index.js           ← mountApp() wiring
│               ├── dom.js             ← virtual DOM (hxs, render, diff)
│               ├── events.js          ← action dispatch
│               ├── router.js          ← hash-based router
│               └── state.js           ← Store class (deep proxy)
│
├── server/
│   ├── index.js                       ← HTTP + WS bootstrap
│   ├── game/
│   │   ├── GameEngine.js              ← state machine, move/collision validation
│   │   ├── MapGenerator.js            ← 15×13 map generator
│   │   ├── Player.js                  ← player model
│   │   └── Bomb.js                    ← bomb model, explosion, chain detonation
│   └── network/
│       ├── socketHandler.js           ← WS lifecycle + message routing
│       └── chatController.js          ← chat validation + broadcast
│
└── shared/
    ├── constants.js                   ← shared constants (grid, timers, lives)
    └── events.js                      ← WS event name constants
```
