import { TEXT_DE } from "./locale.de";
import { TEXT_EN, TEXT_KEYS, TextKey } from "./locale.en";
import { TEXT_ES } from "./locale.es";
import { TEXT_FR } from "./locale.fr";
import { LanguageOpts, SUPPORTED_LANGS, localeStore } from "./locale.store";

export const isLangSupported = (x: unknown): x is LanguageOpts => {
    return typeof x === "string" && SUPPORTED_LANGS.includes(x as LanguageOpts);
};

export const isValidKey = (x: unknown): x is TextKey => {
    return typeof x === "string" && TEXT_KEYS.includes(x as TextKey);
};

export const setLanguage = (lang: LanguageOpts) => {
    localStorage.setItem(window.cfg.label.lang, lang);
    localeStore.update({ lang });
};

export const getText = (key: TextKey): string => {
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
