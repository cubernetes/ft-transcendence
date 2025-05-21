import { getText, isValidKey } from "../modules/locale/locale.utils";

type ElementParams = {
    text?: string;
    i18nVars?: Record<string, string | number>;
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
        text = "",
        i18nVars = {},
        attributes = {},
        props = {},
        events = {},
        children = [],
    }: ElementParams & { style?: Partial<CSSStyleDeclaration> } = {}
): HTMLElementTagNameMap[T] => {
    const el = document.createElement(tag);
    el.className = className;

    // Handle translation
    const isI18nKey = isValidKey(text);
    el.textContent = isI18nKey ? getText(text, i18nVars) : text;
    if (isI18nKey) el.setAttribute(CONST.ATTR.I18N_TEXT, text);
    if (i18nVars) el.setAttribute(CONST.ATTR.I18N_VARS, JSON.stringify(i18nVars));

    Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
    Object.entries(props).forEach(([key, value]) => ((el as any)[key] = value));
    Object.entries(events).forEach(([event, handler]) => el.addEventListener(event, handler));
    children.forEach((child) => el.appendChild(child));

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
export const replaceChildren = (ctn: UIContainer | null, target: UIComponent) => {
    if (!ctn) return log.warn("Fail to replace children for null container");

    // Create fragment as cache for target elements to append at once
    const fragment = document.createDocumentFragment();
    target.forEach((el) => fragment.appendChild(el));

    // Send destroy event to all children elements
    dispatchEventDown(ctn, new Event("destory"));
    ctn.innerHTML = "";

    ctn.appendChild(fragment);
};
