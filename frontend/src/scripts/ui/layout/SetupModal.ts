import { AIDifficulty, defaultGameConfig } from "@darrenkuro/pong-core";
import { TranslationKey, getText, languageStore } from "../../global/language";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { gameStore } from "../../modules/game/game.store";
import { createTournamentController } from "../../modules/tournament/tournament.controller";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { sendGameStart } from "../../modules/ws/ws.service";
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

    const btnGroup = createButtonGroup(btnLabels, []);

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

//TODO: Implement logic for when the friend enters the game ID
const createLobby = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("create_lobby"));
    translatableElements["create_lobby"] = title;

    const line = createSetupLine();

    const username = authStore.get().username;
    const creator = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
        text: `Your Name: ${username || "Anonymous"}`,
    });

    // Game ID
    const gameId = crypto.randomUUID().split("-")[0]; // Replace with backend ID when available
    const gameIdLabel = createEl("span", "text-gray-600 mr-2");
    gameIdLabel.textContent = "Game ID:";

    const gameIdValue = createEl(
        "code",
        "text-blue-800 font-semibold text-md bg-white px-2 py-1 rounded shadow-sm"
    );
    gameIdValue.textContent = gameId;

    const copyBtn = createButton(
        "Copy",
        "ml-4 px-3 py-1 rounded hover:bg-blue-600 transition-all",
        () => {
            navigator.clipboard.writeText(gameId).then(() => {
                copyBtn.textContent = "Copied!";
                setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
            });
        }
    );

    const gameIdContainer = createEl(
        "div",
        "flex items-center justify-center gap-2 mt-6 p-3 bg-gray-200 rounded-lg shadow-inner"
    );
    gameIdContainer.appendChild(gameIdLabel);
    gameIdContainer.appendChild(gameIdValue);
    gameIdContainer.appendChild(copyBtn);

    const info = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
        text: "Share this ID with your friends to join your game.",
    });

    const section = createSectionContainer(
        "w-1/2 bg-gray-300 p-8 items-center shaded relative rounded-lg shadow-lg space-y-4",
        [returnBtn, title, line, creator, gameIdContainer, info]
    );

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const joinLobby = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("join_lobby"));
    translatableElements["join_lobby"] = title;

    const line = createSetupLine();

    const username = authStore.get().username;
    const creator = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
        text: `Your Name: ${username || "Anonymous"}`,
    });

    // Game ID

    const gameIdInput = createEl("input", "p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: { placeholder: getText("game_id") },
    });

    const joinBtn = createButton(
        "Join",
        "ml-4 px-3 py-1 rounded hover:bg-blue-600 transition-all",
        () => {
            const gameId = gameIdInput.value.trim();
            if (!gameId) {
                return window.log.error("Game ID is required.");
            }
            window.log.debug("Joining game with ID:", gameId);

            //TODO: Implement the join lobby logic
            // const { controller } = gameStore.get();
            // if (!controller) {
            //     return window.log.error("Controller not initialized.");
            // }

            // controller.joinLobby(gameId);
            // sendGameStart(gameId);
        }
    );

    const info = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
        text: "Enter the Game ID to join your friend's game.",
    });

    const section = createSectionContainer(
        "w-1/2 bg-gray-300 p-8 items-center shaded relative rounded-lg shadow-lg space-y-4",
        [returnBtn, title, line, creator, gameIdInput, joinBtn, info]
    );

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const onlineMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("setup_online"));
    translatableElements["setup_online"] = title;

    const line = createSetupLine();

    const createLobbyBtn = createCtaBtn("create_lobby", () => {
        createLobby(ctn);
        // navigateTo("onlinegame");
    });

    const joinLobbyBtn = createCtaBtn("join_lobby", () => {
        joinLobby(ctn);
        // navigateTo("onlinegame");
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
    let p1 = createInput("name_player_1");
    const username = authStore.get().username;
    if (authStore.get().isAuthenticated && username) {
        p1.value = username;
    }
    const difficultyGrp = createDifficultyGroup();
    const { errorDiv, showErr, hideErr } = createError();

    const playBtn = createCtaBtn("setup_play", () => {
        const selected = difficultyGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!selected) {
            return showErr("select_Difficulty");
        }

        const difficulty = (selected.textContent?.toUpperCase() as AIDifficulty) || "MEDIUM";
        hideErr();

        const { controller } = gameStore.get();
        if (!controller) {
            return showErr("initialize_controller");
        }
        gameStore.update({ players: [p1.value, "The AI"] });
        controller.startGame("ai", {
            ...defaultGameConfig,
            playTo: 5,
            aiDifficulty: difficulty,
            aiMode: true,
        });
    });

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
        returnBtn,
        title,
        line,
        p1,
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
        if (!player1 || !player2 || player1 === player2) {
            return showErr("player_names_required");
        }
        hideErr();
        const { controller } = gameStore.get();
        if (!controller) {
            return showErr("initialize_controller");
        }
        gameStore.update({ players: [player1, player2] });
        controller.startGame("local", {
            ...defaultGameConfig,
            playTo: 5,
        });
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
        const players = new Set<string>();
        for (let i = 0; i < playerAmount; i++) {
            const player = playerInputs[i].value.trim();
            if (!player || players.has(player)) {
                return showErr("player_names_required");
            }
            players.add(player);
        }
        hideErr();
        const controller = createTournamentController([...players]);
        tournamentStore.update({ controller });
        controller.startTournament();
        navigateTo("tournament");
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
    const { round } = tournamentStore.get();
    if (round !== null) {
        window.log.error("Tournament already started. Cannot create a new tournament.");
        navigateTo("tournament");
    } else {
        window.log.debug("Tournament not started. Proceeding to create a new tournament.");
    }
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
