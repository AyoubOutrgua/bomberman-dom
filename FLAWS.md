# Bomberman — Open Issues For Teammates

Only unresolved / action-needed issues are listed below.

---

## Task 1 — Lobby / Match Start Flow

### 1. Lobby countdown does not follow the project rules

**Expected**

- Wait up to **20 seconds** for players.
- If player count is **more than 2** and room does not reach 4 before 20s, start a **10-second ready countdown**.
- If room reaches **4 players** before 20s, start the **10-second ready countdown** immediately.

**Current behavior**

- Countdown values are hardcoded to **2 seconds** and **1 second**.
- Countdown starts when player count is `>= 2`, not when it is **more than 2** after the waiting phase.
- Final locked countdown is **1 second**, not **10 seconds**.

**Where**

- `server/network/socketHandler.js`
  - `handleRoomTimer()`
  - `scheduleNextTick()`

**What should change**

- Replace the hardcoded timer values with the correct flow:
  - waiting phase = **20s**
  - ready/locked countdown = **10s**
- Apply the exact condition from the subject:
  - **3 or 4 players** after waiting phase → 10s countdown
  - **4 players early** → immediate 10s countdown

---

## Task 3 — Movement / Networking

### 2. Movement messages are sent every frame while a key is held

**Expected**

- Input/network traffic should be controlled and efficient.
- Server should not receive unnecessary repeated movement packets each frame if the direction did not change.

**Current behavior**

- While a movement key is held, the client sends `PLAYER_MOVED` every frame.
- This can produce ~60 WebSocket messages per second per player.
- It gets worse when a player is pushing against a wall/brick, because packets continue even when position is not changing.

**Where**

- `client/src/lib/loop.js`

**What should change**

- Avoid sending movement packets every frame.
- Send only when:
  - direction changes
  - player stops
  - or at a controlled/throttled movement tick

---

### 3. Player keeps “moving” visually while colliding with wall/brick

**Expected**

- If collision blocks actual movement, player should not look like they are advancing normally forever into the wall.

**Current behavior**

- When a player holds a direction into a wall/brick, movement packets still go out and walk animation can continue even though position is blocked.

**Where**

- `server/game/GameEngine.js`
- `client/src/lib/loop.js`

**What should change**

- Review how `isMoving` / animation state is decided when collision prevents position change.
- Animation should reflect real movement, not only pressed keys.

---

## Task 4 — Game State / Match Resolution

### 4. Game may not end correctly when a player disconnects during a match

**Expected**

- If a disconnect leaves only one alive/remaining player, the round should end and winner should be declared.

**Current behavior**

- During `"playing"` state, disconnect removes the player from the game state, but there is no winner check immediately after that.
- If no further bomb event happens, the game can remain stuck without emitting `GAME_OVER`.

**Where**

- `server/network/socketHandler.js`
- `server/game/GameEngine.js`

**What should change**

- After `PLAYER_DISCONNECTED` during an active match, re-check remaining alive players.
- If only one player remains, emit `GAME_OVER` immediately.

---

## Suggested Priority

1. **Lobby countdown / start flow**
2. **Disconnect should end the round**
3. **Movement packet spam**
4. **Collision vs movement animation state**
