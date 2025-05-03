import { createStore } from "../../global/store";
import { getText, isLangSupported, translate } from "./locale.utils";

export const SUPPORTED_LANGS = ["en", "de", "fr", "es"] as const;
export type LanguageOpts = (typeof SUPPORTED_LANGS)[number];

type LocaleState = { locale: Intl.Locale; lang: LanguageOpts };

const initLocaleState = (): LocaleState => {
    // Check local storage for stored language preference
    const key = window.cfg.label.lang;
    const stored = localStorage.getItem(key);
    if (stored && isLangSupported(stored)) {
        const locale = new Intl.Locale(navigator.language);
        const lang = stored;
        return { locale, lang };
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
