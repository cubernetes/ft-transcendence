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
        // style,
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

    // if (style) {
    //     for (const [key, value] of Object.entries(style)) {
    //         if (value != null) {
    //             (el.style as any)[key] = value;
    //         }
    //     }
    // }

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
