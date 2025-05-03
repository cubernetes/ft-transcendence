import { createStore } from "../../global/store";
import { getText, isLangSupported, isValidKey } from "./locale.utils";

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
    // Translate textContent
    document.querySelectorAll<HTMLElement>("[data-i18n-key]").forEach((el) => {
        const key = el.dataset.i18nKey!;
        if (!isValidKey(key)) return window.log.warn(`Invalid i18n key ${key}`);

        el.textContent = getText(key);
    });

    // Translate placeholders
    document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((el) => {
        const key = el.dataset.i18nPlaceholder!;
        if (!isValidKey(key)) return window.log.warn(`Invalid i18n key ${key}`);

        el.placeholder = getText(key);
    });

    // Translate image alts
    document.querySelectorAll<HTMLElement>("[data-i18n-attr-alt]").forEach((el) => {
        const key = el.dataset.i18nAttrAlt!;
        if (!isValidKey(key)) return window.log.warn(`Invalid i18n key ${key}`);

        el.setAttribute("alt", getText(key));
    });
});
