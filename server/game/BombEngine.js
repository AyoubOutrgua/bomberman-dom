import { randomUUID } from 'node:crypto';
import { Bomb } from './Bomb.js';
import { 
    BOMB_TIMER, BLAST_RADIUS_MAX, ITEM_DROP_CHANCE, 
    ITEM_TYPES, SPEED_MAX, SPEED_INCREMENT 
} from '../../shared/constants.js';
import { gameEvents, broadcastToRoom } from '../network/socketHandler.js';

import {TILE_SIZE, TILE, MAP_HEIGHT, MAP_WIDTH } from '../../shared/constants.js';

const tileCol = (px) => Math.floor((px + 24) / TILE_SIZE);
const tileRow = (py) => Math.floor((py + 33) / TILE_SIZE);


export function computeBlastCells(map, row, col, radius) {
    const cells = [{ row, col, role: 'center', rotation: 0 }];
    const DIRS = [
        { dr: -1, dc: 0, rotation: 270 },
        { dr: 1, dc: 0, rotation: 90 },
        { dr: 0, dc: -1, rotation: 180 },
        { dr: 0, dc: 1, rotation: 0 },
    ];

    for (const { dr, dc, rotation } of DIRS) {
        for (let step = 1; step <= radius; step++) {
            const r = row + dr * step;
            const c = col + dc * step;

            if (r < 0 || r >= MAP_HEIGHT || c < 0 || c >= MAP_WIDTH) break;

            const cell = map[r][c];
            if (cell === TILE.WALL) break;

            if (cell === TILE.BRICK) {
                cells.push({ row: r, col: c, role: 'tip', rotation, destroysBrick: true });
                break;
            }

            const role = (step === radius) ? 'tip' : 'arm';
            cells.push({ row: r, col: c, role, rotation });
        }
    }
    return cells;
}

export function placeBomb(game, roomId, playerId) {
    const player = game.players.get(playerId);
    if (!player || !player.isAlive) return;

    const activeBombs = [...game.bombs.values()].filter(b => b.ownerId === playerId).length;
    if (activeBombs >= player.maxBombs) return;



const col = tileCol(player.x);
const row = tileRow(player.y);

    const cellOccupied = [...game.bombs.values()].some(b => b.row === row && b.col === col);
    if (cellOccupied) return;

    const bomb = new Bomb(playerId, row, col, player.blastRadius);
    game.bombs.set(bomb.id, bomb);

    bomb.timer = setTimeout(() => detonateBomb(game, roomId, bomb), BOMB_TIMER);

    broadcastToRoom(roomId, {
        type: 'BOMB_PLACED',
        payload: { bombId: bomb.id, x: col * TILE_SIZE, y: row * TILE_SIZE, ownerId: playerId },
    });
}

export function detonateBomb(game, roomId, bomb) {
    if (bomb.detonated) return;
    bomb.detonated = true;

    if (bomb.timer) { clearTimeout(bomb.timer); bomb.timer = null; }
    game.bombs.delete(bomb.id);

    const blastCells = computeBlastCells(game.map, bomb.row, bomb.col, bomb.blastRadius);
    const destroyedWalls = [];
    const itemDrops = [];

    for (const cell of blastCells) {
        if (cell.destroysBrick) {
            game.map[cell.row][cell.col] = TILE.FLOOR;
            destroyedWalls.push({ row: cell.row, col: cell.col });

            if (Math.random() < ITEM_DROP_CHANCE) {
                const types = [ITEM_TYPES.BOMB, ITEM_TYPES.FLAME, ITEM_TYPES.SPEED];
                const type = types[Math.floor(Math.random() * types.length)];
                const itemId = randomUUID();
                game.items.set(itemId, { id: itemId, type, row: cell.row, col: cell.col });
                itemDrops.push({ id: itemId, type, row: cell.row, col: cell.col });
            }
        }
    }

    const deadPlayers = applyBlastDamage(game, roomId, blastCells);

    const chainingBombs = [];
    for (const cell of blastCells) {
        for (const [, otherBomb] of game.bombs) {
            if (!otherBomb.detonated && otherBomb.row === cell.row && otherBomb.col === cell.col) {
                chainingBombs.push(otherBomb);
            }
        }
    }

    const owner = game.players.get(bomb.ownerId);
    if (owner) {
        owner.score += destroyedWalls.length * 10;
        owner.score += deadPlayers.length * 500;
    }

    broadcastToRoom(roomId, {
        type: 'BOMB_EXPLODED',
        payload: {
            bombId: bomb.id,
            explosionCells: blastCells,
            destroyedWalls,
            deadPlayers,
            droppedItems: itemDrops,
            scoreUpdate: owner ? { playerId: bomb.ownerId, score: owner.score } : null,
        },
    });

    if (chainingBombs.length > 0) {
        chainReact(game, roomId, chainingBombs);
    }

    checkRoundEnd(game, roomId);
}

function applyBlastDamage(game, roomId, blastCells) {
    const deadPlayers = [];
    const now = Date.now();

    for (const [playerId, player] of game.players) {
        if (!player.isAlive) continue;
        if (now < player.invincibleUntil) continue;

      const pRow = tileRow(player.y);
const pCol = tileCol(player.x);

        const isHit = blastCells.some(c => c.row === pRow && c.col === pCol);
        if (!isHit) continue;

        player.lives--;
        player.invincibleUntil = now + 2000;

        if (player.lives <= 0) {
            player.isAlive = false;
            deadPlayers.push(playerId);
            gameEvents.emit('PLAYER_DEAD', playerId, roomId);
        } else {
            gameEvents.emit('PLAYER_HIT', playerId, roomId, { livesLeft: player.lives });
            broadcastToRoom(roomId, {
                type: 'PLAYER_HIT',
                payload: { playerId, livesLeft: player.lives },
            });
        }
    }
    return deadPlayers;
}

export function chainReact(game, roomId, bombs) {
    for (const bomb of bombs) {
        setImmediate(() => detonateBomb(game, roomId, bomb));
    }
}

export function checkItemPickups(game, roomId) {
    for (const [playerId, player] of game.players) {
        if (!player.isAlive) continue;
   const pRow = tileRow(player.y);
const pCol = tileCol(player.x);
        for (const [itemId, item] of game.items) {
            if (item.row === pRow && item.col === pCol) {
                game.items.delete(itemId);

                if (item.type === ITEM_TYPES.SPEED) player.speed = Math.min(player.speed + SPEED_INCREMENT, SPEED_MAX);
                if (item.type === ITEM_TYPES.BOMB) player.maxBombs++;
                if (item.type === ITEM_TYPES.FLAME) player.blastRadius = Math.min(player.blastRadius + 1, BLAST_RADIUS_MAX);

                broadcastToRoom(roomId, {
                    type: 'ITEM_COLLECTED',
                    payload: { 
                        itemId, 
                        playerId, 
                        itemType: item.type,
                        newStats: { speed: player.speed, maxBombs: player.maxBombs, blastRadius: player.blastRadius } 
                    },
                });
            }
        }
    }
}

function checkRoundEnd(game, roomId) {
    const alivePlayers = [...game.players.values()].filter(p => p.isAlive);
    if (alivePlayers.length <= 1) {
        const winnerId = alivePlayers[0]?.id ?? null;
        gameEvents.emit('GAME_OVER', roomId, winnerId);
        if (game.loop) clearInterval(game.loop);
    }
}