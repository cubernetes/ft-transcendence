import { twMerge } from "tailwind-merge";
import { LanguageOpts, localeStore } from "../../modules/locale/locale.store";
import { setLanguage } from "../../modules/locale/locale.utils";
import { createButton } from "../components/Button";
import { createContainer } from "../components/Container";

type LangTuple = [code: LanguageOpts, flag: string, label: string];
const LANGS = [
    ["en", "🇺🇸", "English"],
    ["de", "🇩🇪", "Deutsch"],
    ["fr", "🇫🇷", "Français"],
    ["es", "🇪🇸", "Español"],
] as const satisfies LangTuple[];

const FLAG = Object.fromEntries(LANGS.map(([c, f]) => [c, f])) as Record<LanguageOpts, string>;

export const createLanguageButton = (tw = ""): UIContainer => {
    const triggerBtn = createButton({
        text: FLAG[localeStore.get().lang],
        tw: "w-10 h-10 rounded-full flex items-center justify-center text-2xl hover:bg-white/20 focus:outline-none group transition",
        click: () => {
            popoverCtn.classList.toggle("hidden");
        },
    });

    const popoverCtn = createContainer({
        tw: [
            "hidden absolute top-full mt-2 right-0 bg-white rounded shadow",
            "w-40 text-gray-800 z-10",
        ].join(" "),
    });

    LANGS.forEach(([code, flag, label]) => {
        const langBtn = createButton({
            tw: "lang-item flex items-center gap-2 py-2 px-4 w-full text-left hover:bg-gray-100",
            text: `${flag} ${label}`,
            click: () => {
                setLanguage(code);
                triggerBtn.textContent = flag;
                popoverCtn.classList.add("hidden");
            },
        });
        popoverCtn.appendChild(langBtn);
    });

    const ctn = createContainer({
        tw: "absolute top-6 right-6 z-50",
        children: [triggerBtn, popoverCtn],
    });

    return ctn;
};
