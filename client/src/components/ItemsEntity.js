import { hxs } from '../lib/framework/index.js';

export const ItemsEntity = (items) => {
    const TILE_SIZE = 48;
    return (items || []).map(item =>
        hxs('div', {
            key: item.id,
            class: `entity-item item-${item.type}`,
            style: `left:${item.col * TILE_SIZE}px; top:${item.row * TILE_SIZE}px;`
        })
    );
};