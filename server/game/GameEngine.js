import { gameEvents, broadcastToRoom } from '../network/socketHandler.js';
import { Player } from './Player.js';
import { isColliding } from '../../shared/physics.js';
import { getGrid } from './MapGenerator.js';

const activeGames = new Map();

gameEvents.on("GAME_STARTED", (roomId, playersList) => {
    if (!activeGames.has(roomId)) {
        
        const playersMap = new Map();
        
        if (playersList) {
            playersList.forEach(p => {
                playersMap.set(p.id, new Player(p.id, p.username, "player-white", p.x, p.y));
            });
        }

        const BASE_MAP = getGrid();

        activeGames.set(roomId, { 
            map: BASE_MAP, 
            players: playersMap
        });
    }
});

gameEvents.on("PLAYER_MOVED", (playerId, roomId, payload) => {
    
    const game = activeGames.get(roomId);
    if (!game) return;
    if (!game.players.has(playerId)) return;

    const player = game.players.get(playerId);
    
    if (payload.direction === 'none') {
        if (player.isMoving) {
            player.isMoving = false;
            broadcastToRoom(roomId, { 
                type: "PLAYER_MOVED", 
                payload: {
                    id: playerId,
                    x: player.x,
                    y: player.y,
                    direction: player.direction,
                    isMoving: false,
                }
            });
        }
    } else {
        let nextX = player.x;
        let nextY = player.y;

        if (payload.direction === 'ArrowUp') nextY -= player.speed;
        if (payload.direction === 'ArrowDown') nextY += player.speed;
        if (payload.direction === 'ArrowLeft') nextX -= player.speed;
        if (payload.direction === 'ArrowRight') nextX += player.speed;

        if (!isColliding(nextX, nextY, player.x, player.y, game.map)) {
            player.x = nextX;
            player.y = nextY;
        }
        
        player.direction = payload.direction;
        player.isMoving = true;

        broadcastToRoom(roomId, { 
            type: "PLAYER_MOVED", 
            payload: {
                id: playerId,
                x: player.x,
                y: player.y,
                direction: player.direction,
                isMoving: true
            }
        });
    }
});

gameEvents.on("PLAYER_DISCONNECTED", (playerId, roomId) => {
    const game = activeGames.get(roomId);
    if (game) {
        game.players.delete(playerId);
        if (game.players.size === 0) {
            activeGames.delete(roomId);
        }
    }
});