import { TranslationKey, getText, languageStore } from "../../global/language";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { gameStore } from "../../modules/game/game.store";
import { tournamentStart } from "../../modules/tournament/tournament.create";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createError } from "../components/Error";
import { createReturnButton } from "../components/ReturnButton";
import { createSectionContainer } from "../components/SectionContainer";
import { createBodyText, createTitleText } from "../components/Text";

const createSetupLine = () => createEl("hr", "border-t-2 border-dotted border-white mb-6");

const translatableElements: Partial<Record<string, HTMLElement>> = {};

languageStore.subscribe(() => {
    (Object.keys(translatableElements) as TranslationKey[]).forEach((key) => {
        const el = translatableElements[key];
        if (el) {
            if (el instanceof HTMLInputElement) {
                el.placeholder = getText(key);
            } else {
                el.textContent = getText(key);
            }
        } else {
            console.warn(`Element for key "${key}" not found in translatableElements.`);
        }
    });
});

const createCtaBtn = (textKey: TranslationKey, cb: () => void): HTMLButtonElement => {
    const btn = createButton(
        getText(textKey),
        "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        cb
    );
    translatableElements[textKey] = btn;
    return btn;
};

const createDifficultyGroup = () => {
    const label = createBodyText(getText("difficulty"));
    translatableElements["difficulty"] = label;

    const difficultyKeys = ["easy", "medium", "hard"] as TranslationKey[];
    const btnLabels = difficultyKeys.map((key) => getText(key)); // Get button labels as strings
    const btnCallbacks = difficultyKeys.map((key) => () => {
        window.log.debug(`Selected difficulty: ${key}`);
    });

    const btnGroup = createButtonGroup(btnLabels, btnCallbacks);

    difficultyKeys.forEach((key, index) => {
        const btn = btnGroup.children[index] as HTMLElement;
        translatableElements[key] = btn;
    });

    const difficultyGrp = createEl("div", "flex flex-col w-full mt-6", {
        children: [label, btnGroup],
    });
    return difficultyGrp;
};

const createInput = (placeholderKey: TranslationKey | string) =>
    createEl("input", "w-full p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: { placeholder: getText(placeholderKey) },
    });

const onlineMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("setup_online"));
    translatableElements["setup_online"] = title;

    const line = createSetupLine();

    const createLobbyBtn = createCtaBtn("create_lobby", () => {
        window.log.info("Creating a new lobby...");
        navigateTo("onlinegame");
    });

    const joinLobbyBtn = createCtaBtn("join_lobby", () => {
        window.log.info("Joining a new lobby...");
        navigateTo("onlinegame");
    });

    const BtnGrp = createEl("div", "flex flex-col space-y-4 items-center mt-4", {
        children: [createLobbyBtn, joinLobbyBtn],
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center shaded relative", [
        returnBtn,
        title,
        line,
        BtnGrp,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const aiMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("play_ai"));
    translatableElements["play_ai"] = title;

    const line = createSetupLine();
    const difficultyGrp = createDifficultyGroup();
    const { errorDiv, showErr, hideErr } = createError();

    const playBtn = createCtaBtn("setup_play", () => {
        const selected = difficultyGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!selected) {
            return showErr("select_Difficulty");
        }

        const difficulty = selected.textContent?.toUpperCase() || "MEDIUM";
        hideErr();

        const { controller } = gameStore.get();
        if (!controller) {
            return showErr("initialize_controller");
        }

        navigateTo("aigame");
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
        returnBtn,
        title,
        line,
        difficultyGrp,
        playBtn,
        errorDiv,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const localMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("setup_play_local"));
    translatableElements["setup_play_local"] = title;

    const line = createSetupLine();

    const playerLabel = createBodyText(getText("enter_names"));
    translatableElements["enter_names"] = playerLabel;

    const p1 = createInput("name_player_1");
    const p2 = createInput("name_player_2");
    translatableElements["name_player_1"] = p1;
    translatableElements["name_player_2"] = p2;
    const playersSection = createEl("div", "flex flex-col space-y-4 w-full", {
        children: [playerLabel, p1, p2],
    });

    const { errorDiv, showErr, hideErr } = createError();

    const playBtn = createCtaBtn("setup_play", () => {
        const player1 = p1.value.trim();
        const player2 = p2.value.trim();
        if (!player1 || !player2) {
            return showErr("player_names_required");
        }

        const gameData = { player1, player2 };
        hideErr();
        navigateTo("localgame");
        window.log.debug("Navigated to localgame with gameData:", gameData);
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
        returnBtn,
        title,
        line,
        playersSection,
        playBtn,
        errorDiv,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const setParticipants = (ctn: HTMLElement, playerAmount: number) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("start_tournament"));
    translatableElements["start_tournament"] = title;

    const line = createSetupLine();

    const { errorDiv, showErr, hideErr } = createError();

    const playerInputs: HTMLInputElement[] = [];
    for (let i = 0; i < playerAmount; i++) {
        const translationKey = `name_player_${i + 1}` as TranslationKey; // Dynamically generate the key
        const playerInput = createInput(translationKey); // Pass the dynamic key to createInput
        translatableElements[translationKey] = playerInput; // Track the input for language updates
        playerInputs.push(playerInput);
    }

    const tournamentCreateBtn = createCtaBtn("start_tournament", () => {
        for (let i = 0; i < playerAmount; i++) {
            const playerInput = playerInputs[i];
            if (!playerInput.value.trim()) {
                return showErr("player_names_required");
            }
        }

        hideErr();
        window.log.debug(`Tournament Start Data: ${playerInputs}`);
        tournamentStart(playerInputs);
    });

    const inputsWrapper = createEl("div", "grid grid-cols-1 md:grid-cols-2 gap-4 w-full", {
        children: playerInputs,
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
        returnBtn,
        title,
        line,
        inputsWrapper,
        tournamentCreateBtn,
        errorDiv,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const tournamentMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("create_tournament"));
    translatableElements["create_tournament"] = title;

    const line = createSetupLine();

    const modeLabel = createBodyText(getText("player_number"));
    translatableElements["player_number"] = modeLabel;

    const modeBtnGrp = createButtonGroup(["4P", "8P"], []);
    const modeSection = createEl("div", "flex flex-col w-full mt-6", {
        children: [modeLabel, modeBtnGrp],
    });

    const { errorDiv, showErr, hideErr } = createError();

    const tournamentCreateBtn = createCtaBtn("start_tournament", () => {
        const mode = modeBtnGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!mode) {
            return showErr("select_player_amount");
        }

        hideErr();
        const playerAmount = mode.textContent === "4P" ? 4 : 8;
        setParticipants(ctn, playerAmount);
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
        returnBtn,
        title,
        line,
        modeSection,
        tournamentCreateBtn,
        errorDiv,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

export const createSetupModal = (): HTMLElement => {
    const title = createTitleText(getText("setup_choose_mode"));
    translatableElements["setup_choose_mode"] = title;

    const line = createSetupLine();

    const wrapper = createEl("div", "w-full");

    const localBtnCb = () => localMode(wrapper);
    const aiBtnCb = () => aiMode(wrapper);
    const onlineBtnCb = () => onlineMode(wrapper);
    const tournamentCreateBtnCb = () => tournamentMode(wrapper);

    const btnLabels = ["setup_local", "setup_ai"];
    const btnCallbacks = [localBtnCb, aiBtnCb];

    if (authStore.get().isAuthenticated) {
        btnLabels.push("setup_online");
        btnCallbacks.push(onlineBtnCb);
    }

    const gameBtnGrp = createButtonGroup(
        (btnLabels as TranslationKey[]).map((key) => getText(key)),
        btnCallbacks,
        "flex-1",
        "mt-4"
    );

    btnLabels.forEach((key, index) => {
        translatableElements[key] = gameBtnGrp.children[index] as HTMLElement;
    });

    const children = [title, line, gameBtnGrp];

    if (authStore.get().isAuthenticated) {
        const tournamentBtn = createCtaBtn("setup_tournament_mode", tournamentCreateBtnCb);
        translatableElements["setup_tournament_mode"] = tournamentBtn;
        children.push(tournamentBtn);
    }

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8", children);
    wrapper.appendChild(section);

    return wrapper;
};
