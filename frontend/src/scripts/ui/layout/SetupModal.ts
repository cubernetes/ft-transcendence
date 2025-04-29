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

const createCtaBtn = (key: TranslationKey, cb: () => void): HTMLButtonElement => {
    const btn = createButton(
        getText(key),
        "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        cb
    );

    const unsubscribe = languageStore.subscribe(() => {
        btn.textContent = getText(key);
    });

    btn.addEventListener("destroy", () => {
        window.log.debug(`Unsubscribing from languageStore for key: ${key}`);
        unsubscribe(); // Unsubscribe from languageStore
    });

    return btn;
};

const createDifficultyGroup = () => {
    const label = createBodyText("difficulty");

    const difficultyKeys = ["easy", "medium", "hard"] as TranslationKey[];
    // const btnLabels = difficultyKeys.map((key) => getText(key)); // Get button labels as strings

    const btnGroup = createButtonGroup(difficultyKeys, []);

    difficultyKeys.forEach((key, index) => {
        const btn = btnGroup.children[index] as HTMLElement;
        // translatableElements[key] = btn;
    });

    const difficultyGrp = createEl("div", "flex flex-col w-full mt-6", {
        children: [label, btnGroup],
    });
    return difficultyGrp;
};

const createInput = (key: TranslationKey | string): HTMLInputElement => {
    if (!key) {
        console.error("createInput called with an invalid key:", key);
    }
    const input = createEl("input", "w-full p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: {
            placeholder: getText(key),
            "data-translation-key": key,
        },
    });

    // Subscribe to language changes and update the text dynamically
    const unsubscribe = languageStore.subscribe(() => {
        input.placeholder = getText(key);
    });

    input.addEventListener("destroy", () => {
        window.log.debug(`Unsubscribing from languageStore for key: ${key}`);
        unsubscribe();
    });

    return input;
};

const onlineMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("setup_online");

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
    const title = createTitleText("play_ai");

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
    const title = createTitleText("setup_play_local");

    const line = createSetupLine();

    const playerLabel = createBodyText("enter_names");

    const p1 = createInput("name_player_1");
    const p2 = createInput("name_player_2");
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
    const title = createTitleText("start_tournament");

    const line = createSetupLine();

    const { errorDiv, showErr, hideErr } = createError();

    const playerInputs: HTMLInputElement[] = [];
    for (let i = 0; i < playerAmount; i++) {
        const translationKey = `name_player_${i + 1}`; // Dynamically generate the key
        const playerInput = createInput(translationKey); // Pass the dynamic key to createInput
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
    const title = createTitleText("create_tournament");

    const line = createSetupLine();

    const modeLabel = createBodyText("player_number");

    const modeBtnGrp = createButtonGroup(["fourP", "eightP"], []);
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
        const playerAmount = mode.textContent === getText("fourP") ? 4 : 8;
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
    const title = createTitleText("setup_choose_mode");

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
        btnLabels as TranslationKey[],
        btnCallbacks,
        "flex-1",
        "mt-4"
    );
    const children = [title, line, gameBtnGrp];

    if (authStore.get().isAuthenticated) {
        const tournamentBtn = createCtaBtn("setup_tournament_mode", tournamentCreateBtnCb);
        children.push(tournamentBtn);
    }

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8", children);
    wrapper.appendChild(section);

    return wrapper;
};
