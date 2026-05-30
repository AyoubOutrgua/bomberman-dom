// Reactive state store: holds client-side game state — phase (lobby/active),
// player list, map grid, bomb positions, scores, chat history. Emits change
// events so components re-render on state transitions.

import { Store } from './framework/index.js';
import { getGrid } from '../../../server/game/MapGenerator.js';
const BASE_MAP = getGrid();
export const initialState = {
    roomId: 'room-01',
    myId: 'P1',
    map: BASE_MAP,      
    players: {
        'P1': {
            x: 48,
            y: 48,
            speed: 1.5,
            direction: 'ArrowDown',
            frame: 0,
            isMoving: false
        },
        'P2': {
            x: 625,
            y: 48,
            speed: 1.5,
            direction: 'ArrowDown',
            frame: 0,
            isMoving: false
        },
        'P3': {
            x: 48,
            y: 520,
            speed: 1.5,
            direction: 'ArrowDown',
            frame: 0,
            isMoving: false
        },
        'P4': {
            x: 625,
            y: 520,
            speed: 1.5,
            direction: 'ArrowDown',
            frame: 0,
            isMoving: false
        }
    }
};

export const store = new Store(initialState);