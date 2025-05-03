import { TEXT_DE } from "./locale.de";
import { I18nKey, TEXT_EN, TEXT_KEYS } from "./locale.en";
import { TEXT_ES } from "./locale.es";
import { TEXT_FR } from "./locale.fr";
import { LanguageOpts, SUPPORTED_LANGS, localeStore } from "./locale.store";

export const isLangSupported = (x: unknown): x is LanguageOpts => {
    return typeof x === "string" && SUPPORTED_LANGS.includes(x as LanguageOpts);
};

export const isValidKey = (x: unknown): x is I18nKey => {
    return typeof x === "string" && TEXT_KEYS.includes(x as I18nKey);
};

export const setLanguage = (lang: LanguageOpts) => {
    localStorage.setItem(CONST.KEY.LANG, lang);
    localeStore.update({ lang });
};

export const getText = (key: I18nKey): string => {
    const { lang } = localeStore.get();
    switch (lang) {
        case "de":
            return TEXT_DE[key];
        case "es":
            return TEXT_ES[key];
        case "fr":
            return TEXT_FR[key];
        case "en":
            return TEXT_EN[key];
    }
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
    // Add extrapolate template
};

// Circle through available languages
export const changeLanguage = () => {
    const currentLang = localeStore.get().lang;
    const nextLangIndex = (SUPPORTED_LANGS.indexOf(currentLang) + 1) % SUPPORTED_LANGS.length;
    const nextLang = SUPPORTED_LANGS[nextLangIndex];
    setLanguage(nextLang);
};
