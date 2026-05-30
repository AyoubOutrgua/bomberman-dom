import { gameEvents, broadcastToRoom } from '../network/socketHandler.js';
import { Player } from './Player.js';
import { isColliding } from '../../shared/physics.js';
import { BASE_MAP } from '../../shared/mockData.js';

const activeGames = new Map();

gameEvents.on("GAME_STARTED", (roomId, playersList) => {
    if (!activeGames.has(roomId)) {
        const gameLoop = setInterval(() => updatePhysics(roomId), 1000 / 60); 
        
        const playersMap = new Map();
        
        if (playersList) {
            playersList.forEach(p => {
                playersMap.set(p.id, new Player(p.id, p.username, "player-white", p.x, p.y));
            });
        }

        activeGames.set(roomId, { 
            map: BASE_MAP, 
            players: playersMap,
            loop: gameLoop
        });
    }
});

function updatePhysics(roomId) {
    const game = activeGames.get(roomId);
    if (!game) return;

    for (const [id, player] of game.players.entries()) {
        if (player.isMoving) {
            let nextX = player.x;
            let nextY = player.y;

            if (player.direction === 'ArrowUp') nextY -= player.speed;
            if (player.direction === 'ArrowDown') nextY += player.speed;
            if (player.direction === 'ArrowLeft') nextX -= player.speed;
            if (player.direction === 'ArrowRight') nextX += player.speed;

            if (!isColliding(nextX, nextY, game.map)) {
                player.x = nextX;
                player.y = nextY;

                broadcastToRoom(roomId, { 
                    type: "PLAYER_MOVED", 
                    payload: {
                        id: id,
                        x: player.x,
                        y: player.y,
                        direction: player.direction,
                        isMoving: true
                    }
                });
            }
        }
    }
}

gameEvents.on("PLAYER_MOVED", (playerId, roomId, payload) => {
    
    const game = activeGames.get(roomId);
    if (!game) {
        return;
    }
    
    if (!game.players.has(playerId)) {
        return;
    }

    const player = game.players.get(playerId);
    
    if (payload.direction === 'none') {
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
    } else {
        player.direction = payload.direction;
        player.isMoving = true;
    }
});

gameEvents.on("PLAYER_DISCONNECTED", (playerId, roomId) => {
    const game = activeGames.get(roomId);
    if (game) {
        game.players.delete(playerId);
        if (game.players.size === 0) {
            clearInterval(game.loop);
            activeGames.delete(roomId);
        }
    }
});