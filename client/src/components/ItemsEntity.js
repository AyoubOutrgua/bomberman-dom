import { TILE_SIZE } from "../../../shared/constants.js";
import { hxs } from "../lib/framework/index.js";

const ITEM_SIZE = 28;
const ITEM_OFFSET = (TILE_SIZE - ITEM_SIZE) / 2;

export const ItemsEntity = (items) => {
  return (items || []).map((item) =>
    hxs("div", {
      key: item.id,
      class: `entity-item item-${item.type}`,
      style: `left:${item.col * TILE_SIZE + ITEM_OFFSET}px; top:${item.row * TILE_SIZE + ITEM_OFFSET}px;`,
    }),
  );
};
