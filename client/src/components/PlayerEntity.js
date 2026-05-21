// Player entity component: renders colored player sprite at grid position.
// Handles walk/death sprite animation from spritesheet and applies smooth
// pixel-position transitions between tiles during movement.

import { hxs } from '../../framework/dom.js';
import { IMAGE_FRAME_SIZE, FRAMES } from '../../../shared/constants.js';

export const PlayerEntity = (player) => {
    const bgPosX = player.frame * IMAGE_FRAME_SIZE; 
    const bgPosY = FRAMES[player.direction].row * IMAGE_FRAME_SIZE;
  
    const offsetX = player.x - 8;
    const offsetY = player.y - 16;
  
    return hxs('div', {
      class: 'player player-01',
      style: `
          left: ${offsetX}px;
          top: ${offsetY}px;
          width: ${IMAGE_FRAME_SIZE}px;
          height: ${IMAGE_FRAME_SIZE}px;
          background-position: -${bgPosX}px -${bgPosY}px;
      `
    });
};