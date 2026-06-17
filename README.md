# Bomberman DOM

A lightweight browser-based Bomberman-like multiplayer game using a minimal DOM virtual-DOM framework and WebSockets.

## Project Overview

- Multiplayer Bomberman clone served from a Node.js server.
- Clients use a small custom framework (DOM VDOM) under `client/src/lib/framework`.
- Server runs a simple game engine in `server/game/*` and handles WebSocket connections via `server/network/*`.
- Game rules: 2–4 players, classic bombs, destructible bricks, power-ups, last player standing wins.

## Features

- Real-time multiplayer gameplay via WebSockets (`ws`).
- Simple lobby with player counter and countdown timer.
- Bombs, explosions, power-ups (bomb, flame, speed).
- Game-over overlay with winner display.
- Chat panel for players in the room.

## Getting Started

Requirements:

- Node.js (v16+ recommended)

Install and run:

```bash
npm install
npm run start
```

Open the game in your browser at: `http://localhost:3000/`

## Development

- Server entry: `server/index.js` (serves client files and WebSocket server)
- Client entry: `client/index.html` -> `client/src/main.js`

To iterate on client code, edit files in `client/src/` and reload the browser.

## Controls

- Movement: arrow keys
- Place bomb: `Space`
- Chat: use the chat input on the right panel

## Project Structure (high level)

- `client/` — front-end code and assets
  - `client/src/` — JS source (components, lib)
- `server/` — Node.js server and game engine
  - `server/game/` — game logic, bomb engine, player model
  - `server/network/` — WebSocket handlers and room management
- `shared/` — constants and physics helpers

## Known Issues & Flaws

See `FLAWS.md` for a curated list of issues discovered during inspection. Critical items include the game-over flow and event handling between server and client.

## Testing End-Game Flow (manual)

1. Open multiple browser tabs (2–4) to `http://localhost:3000/` and join with different nicknames.
2. Start a match (lobby will auto-start when players >=2 and timer expires or when 4 players join).
3. Play until one player remains. Confirm the `GAME_OVER` overlay appears and shows the winner.

If the overlay does not appear, check the browser console for WebSocket messages and ensure the server sends `GAME_OVER`.

## Contributing

- Open an issue for bugs or feature requests.
- Pull requests should include small focused changes.
