import { hxs } from '../lib/framework/index.js'; 

export const BombsEntity = (bombs) =>
    (bombs || []).map(b =>
        hxs('div', {
            key: b.id,
            class: 'entity-bomb',
            style: `left:${b.x + 8}px; top:${b.y + 8}px; background-position: -${(b.frame % 4) * 32}px 0px;`
        })
    );