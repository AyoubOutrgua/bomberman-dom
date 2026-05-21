const ARRAY_MUTATORS = new Set([
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
  "fill",
  "copyWithin",
]);

const isProxyable = (v) =>
  typeof v === "object" &&
  v !== null &&
  !(v instanceof Date) &&
  !(v instanceof RegExp) &&
  !(v instanceof Map) &&
  !(v instanceof Set);

export class Store {
  constructor(initialState, actions = {}) {
    this.actions = actions;
    this._destroyed = false;
    this._isBatching = false;
    this._isQueued = false;
    this._hasMutated = false; // FIX 1: mutation sentinel
    this._subscribers = new Set();

    this._proxyCache = new WeakMap();

    this._rawState = this._deepClone(initialState);
    this.state = this._createDeepProxy(this._rawState);
  }

  // ─── Subscription ──────────────────────────────────────────────────────────

  subscribe(fn) {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  }

  _notify() {
    for (const fn of this._subscribers) fn();
  }

  // ─── Deep Clone ────────────────────────────────────────────────────────────

  _deepClone(data) {
    if (!isProxyable(data)) return data;
    if (Array.isArray(data)) return data.map((item) => this._deepClone(item));
    const clone = {};
    for (const key of Object.keys(data)) {
      clone[key] = this._deepClone(data[key]);
    }
    return clone;
  }

  // ─── Deep Proxy ────────────────────────────────────────────────────────────

  _createDeepProxy(data) {
    if (!isProxyable(data)) return data;
    if (this._proxyCache.has(data)) return this._proxyCache.get(data);

    const self = this;

    // FIX 2: eagerly wrap all nested objects BEFORE creating the proxy,
    // so the get trap never needs to mutate target[key] at read time.
    for (const key of Object.keys(data)) {
      if (isProxyable(data[key])) {
        data[key] = this._createDeepProxy(data[key]);
      }
    }

    const proxy = new Proxy(data, {
      get(target, key, receiver) {
        const value = Reflect.get(target, key, receiver);

        if (Array.isArray(target) && ARRAY_MUTATORS.has(key)) {
          return (...args) => {
            // Only wrap newly added arguments (O(1))
            const wrappedArgs = args.map((arg) =>
              isProxyable(arg) ? self._createDeepProxy(arg) : arg,
            );
            const result = Array.prototype[key].apply(target, wrappedArgs);
            self._hasMutated = true; // FIX 1
            self._scheduleUpdate();
            return result;
          };
        }

        // FIX 2: no lazy target[key] = wrapped mutation here
        return value;
      },

      set(target, key, value, receiver) {
        const oldValue = Reflect.get(target, key, receiver);
        if (Object.is(oldValue, value)) return true;
        if (
          self._proxyCache.has(value) &&
          self._proxyCache.get(value) === oldValue
        )
          return true;

        const newValue = isProxyable(value)
          ? self._createDeepProxy(value)
          : value;

        Reflect.set(target, key, newValue, receiver);
        self._hasMutated = true; // FIX 1
        self._scheduleUpdate();
        return true;
      },
    });

    this._proxyCache.set(data, proxy);
    this._proxyCache.set(proxy, proxy);

    return proxy;
  }

  // ─── Scheduling ────────────────────────────────────────────────────────────

  _scheduleUpdate() {
    if (this._isBatching || this._isQueued || this._destroyed) return;
    this._isQueued = true;

    requestAnimationFrame(() => {
      this._isQueued = false;
      if (!this._destroyed) {
        this._notify();
        this._hasMutated = false;
      }
    });
  }

  // ─── setState ──────────────────────────────────────────────────────────────

  setState(newState) {
    if (this._destroyed) {
      console.warn("[setState] Called on a destroyed Store. Ignoring.");
      return;
    }
    Object.assign(this.state, newState);
  }

  // ─── destroy ───────────────────────────────────────────────────────────────

  destroy() {
    this._destroyed = true;
    this._subscribers.clear();
    this._rawState = null;
    this._proxyCache = null;
  }
}
