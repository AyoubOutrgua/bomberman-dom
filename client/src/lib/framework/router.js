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
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent('popstate'));

};



export const getCurrentPath = () => {

    return window.location.pathname;

};



export const startRouter = () => {
    const handleRouteChange = () => {
        const currentPath = getCurrentPath();
        let handler = null;
        if (routes[currentPath]) {
            handler = routes[currentPath];
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

    window.addEventListener("popstate", handleRouteChange);
    handleRouteChange();

};