import { Store } from './framework/index.js';

export const initialState = {
  currentView: 'login',
  lobby: {
    roomId: null,
    username: null,
    players: [],
    count: 0,
    timeLeft: 0,
    error: null,
    phase: 'waiting',
  },
  chat: [],
  game: {
    status: 'waiting',
    map: [],
    players: {},
    bombs: [],
    explosions: [],
    items: [],
    stats: {},
    startTime: null,
  },
};

const actions = {
    TICK_BOMB_FRAMES(state, { bombs }) {
        bombs.forEach(b => { b.frame = (b.frame + 1) % 4; });
    },
    APPLY_EXPLOSION(state, { bombId, explosionCells, destroyedWalls, deadPlayers, droppedItems, scoreUpdate }) {
        state.game.bombs = state.game.bombs.filter(b => b.id !== bombId);
        
        destroyedWalls.forEach(({ row, col }) => { state.game.map[row][col] = 0; });
        
        state.game.explosions.push({ id: bombId, cells: explosionCells, ttl: 600 });
        
        deadPlayers.forEach(id => {
            if (state.game.players[id]) state.game.players[id].isDead = true;
        });
        
        droppedItems.forEach(item => { state.game.items.push(item); });

        if (scoreUpdate && state.game.stats[scoreUpdate.playerId]) {
            state.game.stats[scoreUpdate.playerId].score = scoreUpdate.score;
        }
    },

    COLLECT_ITEM(state, { itemId, playerId, itemType }) {
        state.game.items = state.game.items.filter(i => i.id !== itemId);
        const s = state.game.stats[playerId];
        if (!s) return;
        if (itemType === 'speed') s.speed = Math.min(s.speed + 0.5, 3.0);
        if (itemType === 'bomb') s.maxBombs = Math.min(s.maxBombs + 1, 8);
        if (itemType === 'flame') s.blastRadius = Math.min(s.blastRadius + 1, 5);
    }
};

export const store = new Store(initialState, actions);
