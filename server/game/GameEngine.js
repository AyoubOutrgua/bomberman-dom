// Game state machine: manages lobby → countdown → active → round-end phases.
// Tracks connected players, validates moves, enforces bomb/explosion rules,
// detects deaths, and broadcasts full state updates to all clients.

import { gameEvents, broadcastToRoom } from '../network/socketHandler.js';
import { Player } from './Player.js';
import { isColliding } from '../../shared/physics.js';
import { BASE_MAP } from '../../shared/mockData.js';

const activeGames = new Map();

gameEvents.on("PLAYER_MOVED", (playerId, roomId, payload) => {
    
    if (!activeGames.has(roomId)) {
        activeGames.set(roomId, { 
            map: BASE_MAP, 
            players: new Map() 
        });
    }
    
    const game = activeGames.get(roomId);

    if (!game.players.has(playerId)) {
        // player one 48,48
        // player two 625,48
        // player three 48,520
        // player four 625,520
        game.players.set(playerId, new Player(playerId, 48, 48)); 
    }

    const player = game.players.get(playerId);
    
    let nextX = player.x;
    let nextY = player.y;
    player.direction = payload.direction;
    player.isMoving = true;

    if (payload.direction === 'ArrowUp') nextY -= player.speed;
    if (payload.direction === 'ArrowDown') nextY += player.speed;
    if (payload.direction === 'ArrowLeft') nextX -= player.speed;
    if (payload.direction === 'ArrowRight') nextX += player.speed;

    if (!isColliding(nextX, nextY, game.map)) {
        player.x = nextX;
        player.y = nextY;
    }

    const playersObject = {};
    for (const [id, p] of game.players.entries()) {
        playersObject[id] = {
            x: p.x,
            y: p.y,
            speed: p.speed,
            direction: p.direction,
            frame: p.frame,
            isMoving: p.isMoving
        };
    }

    broadcastToRoom(roomId, { 
        type: "GAME_STATE", 
        payload: {
            players: playersObject
        }
    });
});