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
