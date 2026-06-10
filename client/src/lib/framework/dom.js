// hxs() — Creates a Virtual DOM node
export const hxs = (type, props, ...children) => {
    const flatChildren = children.flat(Infinity)
    .filter(child => {
        return child !== null &&
        child !== undefined &&
        child !== false &&
        child !== true
    }).map( child => {
        if (typeof child === 'string' || typeof child === 'number') {
            return {
                type: 'TEXT_ELEMENT',
                props: { nodeValue: String(child) },
                children: []
            }
        } else {
            return child
        }
    });

    const { key, ...restProps } = props || {}; 

    return {
        type,
        props: restProps,
        children: flatChildren,
        key: key ?? null
    }
}

// createDOMElement() — Creates a real DOM node from a vnode
export const createDOMElement = (vnode) => {
    let element = null

    if (vnode.type !== 'TEXT_ELEMENT') {
        element = document.createElement(vnode.type)

        for (const [key, value] of Object.entries(vnode.props)) {
            if (key.startsWith('on')) {
                const eventType = key.toLowerCase().substring(2);
                element.addEventListener(eventType, value);
            } else if (key === 'value' || key === 'checked') {
                element[key] = value
            } else {
                element.setAttribute(key, value);
            }
        }
    } else {
        element = document.createTextNode(vnode.props.nodeValue);
    }

    if (vnode.children) {
        for (const child of vnode.children) {
            render(child, element)
        }
    }
    return element
}

// render() — Mounts a vnode into a real DOM container
export const render = (vnode, container) => {
    if (!container) {
        console.warn('[render] Container element is null or undefined. Check that your mount target exists in the DOM.');
        return
    }
    const element = createDOMElement(vnode)
    container.appendChild(element);
}

// diff() — Compare oldVNode vs newVNode, returns a patch() function
export const diff = (oldVNode, newVNode) => {
    
    if (oldVNode === newVNode) {
        return function patch(realDomNode) {
            return realDomNode;
        }
    }

    // Case 1: node removed
    if (newVNode === undefined && oldVNode !== undefined) {
        return function patch(realDomNode) {
            realDomNode.remove();
            return undefined;
        }
    }

    // Case 2: new node
    if (oldVNode === undefined && newVNode !== undefined) {
        return function patch(_unused) {
            return createDOMElement(newVNode);
        }
    }

    // Case 3: different type -> replace everything
    if (oldVNode.type !== newVNode.type) {
        return function patch(realDomNode) {
            const newRealNode = createDOMElement(newVNode);
            realDomNode.replaceWith(newRealNode);
            return newRealNode;
        }
    }

    // Case 4: same type
    if (oldVNode.type === newVNode.type) {

        // Case 4a: text node
        if (newVNode.type === 'TEXT_ELEMENT') {
            if (oldVNode.props.nodeValue !== newVNode.props.nodeValue) {
                return function patch(realDomNode) {
                    realDomNode.nodeValue = newVNode.props.nodeValue;
                    return realDomNode;
                }
            } else {
                return function patch(realDomNode) {
                    return realDomNode;
                }
            }
        } else {
            // Case 4b: normal element -> patch props + reconcile children
            const oldChildren = oldVNode.children || [];
            const newChildren = newVNode.children || [];
            
            if (oldChildren.length === 0 && newChildren.length === 0 && arePropsEqual(oldVNode.props, newVNode.props)) {
                return function patch(realDomNode) {
                    return realDomNode;
                }
            }

            const patchProps = diffProps(oldVNode.props, newVNode.props);

            return function patch(realDomNode) {
                const newRealDomNode = patchProps(realDomNode);

                const currentChildNodes = Array.from(newRealDomNode.childNodes);

                const oldKeyedNodes = {};
                oldChildren.forEach((child, i) => {
                    const key = child.key ?? i;
                    if (key in oldKeyedNodes) {
                        console.warn(`[diff] Duplicate key "${key}" detected. Keys must be unique among siblings.`);
                    }
                    oldKeyedNodes[key] = { vnode: child, dom: currentChildNodes[i] };
                });

                newChildren.forEach((newChild, i) => {
                    const key = newChild.key ?? i;
                    const oldMatch = oldKeyedNodes[key];

                    if (oldMatch) {
                        const patchChild = diff(oldMatch.vnode, newChild);
                        const updatedDom = patchChild(oldMatch.dom);

                        if (newRealDomNode.childNodes[i] !== updatedDom) {
                            newRealDomNode.insertBefore(updatedDom, newRealDomNode.childNodes[i] || null);
                        }

                        delete oldKeyedNodes[key];

                    } else {
                        const newDom = createDOMElement(newChild);
                        newRealDomNode.insertBefore(newDom, newRealDomNode.childNodes[i] || null);
                    }
                });

                for (const oldKey in oldKeyedNodes) {
                    oldKeyedNodes[oldKey].dom.remove();
                }

                return newRealDomNode;
            }
        }
    }
}

// diffProps() — Compare oldProps vs newProps, returns patch()
export const diffProps = (oldProps, newProps) => {
    return function patch(realDomNode) {
        for (const [key, value] of Object.entries(newProps)) {
            if (value !== oldProps[key]) {
                if (key.startsWith('on')) {
                    const eventType = key.toLowerCase().substring(2)
                    if (oldProps[key]) {
                        realDomNode.removeEventListener(eventType, oldProps[key])
                    }
                    realDomNode.addEventListener(eventType, value)
                } else if (key === 'value' || key === 'checked') {
                    realDomNode[key] = value
                } else {
                    realDomNode.setAttribute(key, value)
                }
            }
        }

        for (const key in oldProps) {
            if (!(key in newProps)) {
                if (key.startsWith('on')) {
                    const eventType = key.toLowerCase().substring(2);
                    realDomNode.removeEventListener(eventType, oldProps[key]);
                } else {
                    if (key === 'value') realDomNode.value = '';
                    if (key === 'checked') realDomNode.checked = false;
                    realDomNode.removeAttribute(key);
                }
            }
        }

        return realDomNode;
    }
}

export const arePropsEqual = (oldProps, newProps) => {
    const oldKeys = Object.keys(oldProps || {});
    const newKeys = Object.keys(newProps || {});
    if (oldKeys.length !== newKeys.length) return false;
    
    for (let i = 0; i < oldKeys.length; i++) {
        const key = oldKeys[i];
        if (oldProps[key] !== newProps[key]) return false;
    }
    return true;
};