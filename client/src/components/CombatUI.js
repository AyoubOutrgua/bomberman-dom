// Combat HUD / overlay component: displays player icons with remaining
// lives, active power-up indicators, round timer, and full-screen overlays
// for death/respawn or victory screens.
import { hxs } from '../lib/framework/index.js';

export const CombatUI = (state) => {
    const stats = state.game?.stats || {};
    const players = state.game?.players || {};
    const status = state.game?.status;

    const playerBars = Object.entries(players).map(([id, p], idx) => {
        const s = stats[id] || { lives: 3, score: 0, maxBombs: 1, blastRadius: 1, speed: 1.5 };
        const hearts = Array(Math.max(0, s.lives)).fill('❤').join('');
        return hxs('div', { key: id, class: 'hud-player-bar' },
            hxs('span', { class: `hud-color hud-color-${idx}` }, p.username || `P${idx + 1}`),
            hxs('span', { class: 'hud-lives' }, hearts),
            hxs('span', { class: 'hud-score' }, `${s.score}pts`),
            hxs('span', { class: 'hud-powerups' }, `💣×${s.maxBombs} 🔥×${s.blastRadius} ⚡${s.speed.toFixed(1)}`)
        );
    });

    const overlay = (status === 'finished')
        ? hxs('div', { class: 'overlay-game-over' },
            hxs('h1', {}, 'GAME OVER'),
            hxs('p', {}, state.game.winnerId ? `Winner: ${players[state.game.winnerId]?.username ?? 'Unknown'}` : 'Draw!')
        )
        : null;

    return hxs('div', { id: 'combat-ui' },
        hxs('div', { class: 'hud-bar' }, ...playerBars),
        overlay
    );
};