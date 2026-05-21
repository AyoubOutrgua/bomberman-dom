export const createEventManager = (store) => {
  if (!store) throw new Error("Store is required for EventManager");

  return {
    dispatch(actionName, payload) {
      if (store._destroyed) {
        console.warn(
          `[dispatch] Store is destroyed. Action "${actionName}" ignored.`,
        );
        return;
      }

      if (typeof store.actions?.[actionName] !== "function") {
        console.warn(`[dispatch] Action "${actionName}" not found in Store.`);
        return;
      }

      store._isBatching = true;
      try {
        store.actions[actionName](store.state, payload);
      } finally {
        store._isBatching = false;
      }

      if (!store._destroyed && store._hasMutated) {
        store._notify();
        store._hasMutated = false;
      }
    },
  };
};
