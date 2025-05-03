type ElementParams = {
    text?: string;
    attributes?: Record<string, string>;
    props?: Record<string, any>;
    events?: Record<string, EventListener>;
    children?: HTMLElement[];
};

/**
 * A general type-safe wrapper for creating a HTMLElement.
 * @param tag HTMLElement tag, i.e. `div', `main', etc.
 * @param className optional, for tailwind css classes most
 * @param params optional - available fields: text, attributes, props, events, children
 */
export const createEl = <T extends keyof HTMLElementTagNameMap>(
    tag: T,
    className: string = "",
    {
        text,
        attributes,
        props,
        events,
        children,
    }: ElementParams & { style?: Partial<CSSStyleDeclaration> } = {}
): HTMLElementTagNameMap[T] => {
    const el = document.createElement(tag);
    el.className = className;

    if (text) {
        el.textContent = text;
    }

    if (attributes) {
        for (const [key, value] of Object.entries(attributes)) {
            el.setAttribute(key, value);
        }
    }

    if (props) {
        for (const [key, value] of Object.entries(props)) {
            (el as any)[key] = value;
        }
    }

    if (events) {
        for (const [event, handler] of Object.entries(events)) {
            el.addEventListener(event, handler);
        }
    }

    if (children) {
        for (const child of children) {
            el.appendChild(child);
        }
    }

    return el;
};

export const appendChildren = (ctn: HTMLElement, children: HTMLElement[]) => {
    children.forEach((el) => ctn.appendChild(el));
};

/** Functionally dispatch the event bubbling down to all children elements */
export const dispatchEventDown = (parent: HTMLElement, evt: Event) => {
    // Dispatch the event to the parent first
    parent.dispatchEvent(evt);

    // Dispatch the event to all child elements
    parent.querySelectorAll("*").forEach((child) => {
        child.dispatchEvent(evt);
    });
};

/** Safely replace children in a container */
export const replaceChildren = (ctn: HTMLElement, target: HTMLElement[]) => {
    // Create fragment as cache for target elements to append at once
    const fragment = document.createDocumentFragment();
    target.forEach((el) => fragment.appendChild(el));

    // Send destroy event to all children elements
    dispatchEventDown(ctn, new Event("destory"));
    ctn.innerHTML = "";

    ctn.appendChild(fragment);
};
