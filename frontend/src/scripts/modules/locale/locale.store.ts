import { createStore } from "../../global/store";
import { TEXT_DE } from "./locale.de";
import { I18nKey, TEXT_EN, TEXT_KEYS } from "./locale.en";
import { TEXT_ES } from "./locale.es";
import { TEXT_FR } from "./locale.fr";

export const isLangSupported = (x: unknown): x is LanguageOpts => {
    return typeof x === "string" && SUPPORTED_LANGS.includes(x as LanguageOpts);
};

export const isValidKey = (x: unknown): x is I18nKey => {
    return typeof x === "string" && TEXT_KEYS.includes(x as I18nKey);
};

export const setLanguage = (lang: LanguageOpts) => {
    localStorage.setItem(window.cfg.label.lang, lang);
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
        if (!key || !isValidKey(key)) return window.log.warn(`Invalid i18n key ${key}`);
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

export const SUPPORTED_LANGS = ["en", "de", "fr", "es"] as const;
export type LanguageOpts = (typeof SUPPORTED_LANGS)[number];

type LocaleState = { locale: Intl.Locale; lang: LanguageOpts };

const initLocaleState = (): LocaleState => {
    // Check local storage for stored language preference
    const key = window.cfg.label.lang;
    const stored = localStorage.getItem(key);
    // window.log.debug(stored);
    // window.log.debug("isLangSupported →", isLangSupported);
    if (stored && isLangSupported(stored)) {
        const locale = new Intl.Locale(navigator.language);
        return { locale, lang: stored };
    }

    // Loop through browser language preference and see if any is available
    for (const tag of navigator.languages) {
        const locale = new Intl.Locale(tag);
        const lang = locale.language;
        if (isLangSupported(lang)) return { locale, lang };
    }

    // Default to English if all else fails
    return { locale: new Intl.Locale(navigator.language), lang: "en" };
};

export const localeStore = createStore<LocaleState>(initLocaleState());

// Centralized translation subscriber
localeStore.subscribe(() => {
    const { textKey, placeholderKey, altKey } = window.cfg.label;

    // Translate textContent
    translate<HTMLElement>(textKey, (el, key) => {
        el.textContent = getText(key);
    });

    // Translate placeholders
    translate<HTMLInputElement>(placeholderKey, (el, key) => {
        el.placeholder = getText(key);
    });

    // Translate alt attributes
    translate<HTMLElement>(altKey, (el, key) => {
        el.setAttribute("alt", getText(key));
    });
});
