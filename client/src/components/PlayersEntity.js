// Player entity component: renders colored player sprite at grid position.
// Handles walk/death sprite animation from spritesheet and applies smooth
// pixel-position transitions between tiles during movement.

import { hxs } from "../lib/framework/index.js";
import { IMAGE_FRAME_SIZE, FRAMES } from "../../../shared/constants.js";

const playersClasses = [
  "player-red",
  "player-blue",
  "player-black",
  "player-white",
];

export const PlayersEntity = (players) => {
  const playerElements = [];
  let playerIndex = 0;

    for (const playerId in players) {
        const p = players[playerId];
        
        const bgPosX = p.frame * IMAGE_FRAME_SIZE; 
        const bgPosY = FRAMES[p.direction].row * IMAGE_FRAME_SIZE;
      
        const offsetX = p.x - 8;
        const offsetY = p.y - 16;
      
        const colorClass = playersClasses[playerIndex];
      
        const deadStyle = p.isDead ? 'opacity: 0.3; pointer-events: none;' : '';
        const deadClass = p.isDead ? ' player-dead' : '';
      
        playerElements.push(hxs('div', {
          class: `player ${colorClass} ${deadClass}`, 
          style: `
              left: ${offsetX}px;
              top: ${offsetY}px;
              width: ${IMAGE_FRAME_SIZE}px;
              height: ${IMAGE_FRAME_SIZE}px;
              background-position: -${bgPosX}px -${bgPosY}px;
              ${deadStyle}
          `
        }));

    playerIndex++;
  }

  return playerElements;
};
