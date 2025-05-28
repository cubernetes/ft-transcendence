import { LanguageOpts, localeStore } from "./locale.store";
import { I18nKey, TEXT_KEYS, TEXT_MAP } from "./locale.translation";

export const isValidKey = (x: unknown): x is I18nKey => {
    return typeof x === "string" && TEXT_KEYS.includes(x as I18nKey);
};

export const setLanguage = (lang: LanguageOpts) => {
    localStorage.setItem(CONST.KEY.LANG, lang);
    localeStore.update({ locale: new Intl.Locale(lang), lang });
};

export const getText = (key: I18nKey, vars?: Record<string, string | number>): string => {
    const { lang } = localeStore.get();
    const template = TEXT_MAP[key][lang];

    // Dynamically interpolate string
    const interpolated = template.replace(/{(.*?)}/g, (_, key) => {
        const value = vars?.[key.trim()];
        return value ? String(value) : `{${key}}`;
    });

    return interpolated;
};

export const translate = <E extends HTMLElement>(
    attrName: string,
    cb: (el: E, key: I18nKey) => void
) => {
    document.querySelectorAll<E>(`[${attrName}]`).forEach((el) => {
        const key = el.getAttribute(attrName);
        if (!key || !isValidKey(key)) return log.warn(`Invalid i18n key ${key}`);

        cb(el, key);
    });
};
