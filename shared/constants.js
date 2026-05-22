// Shared game constants used by both client and server.
// GRID: 15 columns × 13 rows, TILE_SIZE = 48px.
// BOMB_TIMER = 3000ms, BLAST_RADIUS starts at 1, up to 5 with power-ups.
// INITIAL_LIVES = 3, LOBBY_WAIT = 20s, COUNTDOWN = 10s, MAX_PLAYERS = 4.

export const TILE_SIZE = 48;
export const IMAGE_FRAME_SIZE = 64;

export const FRAMES = {
    ArrowUp:    { row: 0,  cols: 8 }, 
    ArrowLeft:  { row: 1,  cols: 8 }, 
    ArrowDown:  { row: 2,  cols: 8 }, 
    ArrowRight: { row: 3,  cols: 8 }, 
};