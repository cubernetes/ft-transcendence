type ElementParams = {
    text?: string;
    attributes?: Record<string, string>;
    props?: Record<string, any>;
    events?: Record<string, EventListener>;
    children?: HTMLElement[];
};

export const createEl = <T extends keyof HTMLElementTagNameMap>(
    tag: T,
    className: string,
    { text, attributes, props, events, children }: ElementParams = {}
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
