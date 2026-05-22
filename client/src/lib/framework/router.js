const routes = {};
let _store = null;

export const initRouter = (storeInstance) => {
    _store = storeInstance;
};

export const addRoute = (path, handler) => {
    if (routes[path]) return;
    routes[path] = handler;
};

export const navigateTo = (path) => {
    window.location.hash = path;
};

export const getCurrentPath = () => {
    const raw = window.location.hash.slice(1);
    return raw === "" ? "/" : raw;
};

export const startRouter = () => {
    const handleRouteChange = () => {
        const currentPath = getCurrentPath();
        let handler = null;

        if (routes[currentPath]) {
            handler = routes[currentPath];
        } else {
            for (const path in routes) {
                if (path !== "/" && path !== "*" && currentPath.startsWith(path)) {
                    handler = routes[path];
                    break;
                }
            }
        }
        if (!handler && routes["*"]) {
            handler = routes["*"];
        }

        if (handler) {
            const newState = handler(currentPath);
            if (newState && _store) {
                _store.setState(newState);
            }
        } else {
            console.warn(`404 — No route registered for "${currentPath}"`);
        }
    };

    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("load", handleRouteChange);
};