import { render, diff } from './dom.js';

export { hxs, createDOMElement, render, diff } from './dom.js';
export { Store } from './state.js';
export { createEventManager } from './events.js';
export { addRoute, startRouter, initRouter, navigateTo } from './router.js';

export function mountApp(store, view, containerId) {
    const rootElement = document.getElementById(containerId);
    if (!rootElement) {
        console.warn(`Root element #${containerId} not found`);
        return;
    }

    let currentVNode = view(store.state);
    
    render(currentVNode, rootElement);

    store.subscribe(() => {
        const newVNode = view(store.state);
        const patch = diff(currentVNode, newVNode);
        patch(rootElement.firstChild);
        currentVNode = newVNode;
    });
}