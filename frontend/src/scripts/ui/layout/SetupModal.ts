import { AIDifficulty, defaultGameConfig } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { gameStore } from "../../modules/game/game.store";
import { I18nKey } from "../../modules/locale/locale.en";
import { getText } from "../../modules/locale/locale.utils";
import { createTournamentController } from "../../modules/tournament/tournament.controller";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createError } from "../components/Error";
import { createReturnButton } from "../components/ReturnButton";
import { createSectionContainer } from "../components/SectionContainer";
import { createBodyText, createTitleText } from "../components/Text";

const createSetupLine = () => createEl("hr", "border-t-2 border-dotted border-white mb-6");

const createCtaBtn = (text: I18nKey, click: () => void): HTMLButtonElement => {
    const btn = createButton({
        text,
        tw: "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        click,
    });
    return btn;
};

const createDifficultyGroup = () => {
    const label = createBodyText("difficulty");
    const btns = createButtonGroup({
        texts: ["easy", "medium", "hard"],
        twBtn: "bg-gray-100",
        twSelected: "bg-gray-400",
    });

    const difficultyGrp = createEl("div", "flex flex-col w-full mt-6", {
        children: [label, btns],
    });

    return difficultyGrp;
};

const createInput = (placeholderKey: I18nKey) =>
    createEl("input", "w-full p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: {
            placeholder: getText(placeholderKey),
            [CONST.ATTR.I18N_INPUT]: placeholderKey,
        },
    });

//TODO: Implement logic for when the friend enters the game ID
const createLobby = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("create_lobby"));

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

    const copyBtn = createButton({
        text: "Copy",
        tw: "ml-4 px-3 py-1 rounded hover:bg-blue-600 transition-all",
        click: () => {
            navigator.clipboard.writeText(gameId).then(() => {
                copyBtn.textContent = "Copied!";
                setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
            });
        },
    });

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

    const line = createSetupLine();

    const username = authStore.get().username;
    const creator = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
        text: `Your Name: ${username || "Anonymous"}`,
    });

    // Game ID

    const gameIdInput = createEl("input", "p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: { placeholder: getText("game_id") },
    });

    const joinBtn = createButton({
        text: "Join",
        tw: "ml-4 px-3 py-1 rounded hover:bg-blue-600 transition-all",
        click: () => {
            const gameId = gameIdInput.value.trim();
            if (!gameId) {
                return log.error("Game ID is required.");
            }
            log.debug("Joining game with ID:", gameId);

            navigateTo("onlinegame");

            //TODO: Implement the join lobby logic
            // const { controller } = gameStore.get();
            // if (!controller) {
            //     return log.error("Controller not initialized.");
            // }

            // controller.joinLobby(gameId);
            // sendGameStart(gameId);
        },
    });

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

    const line = createSetupLine();
    let p1 = createInput("name_player");
    const username = authStore.get().username;
    if (authStore.get().isAuthenticated && username) {
        p1.value = username;
    }
    const difficultyGrp = createDifficultyGroup();
    const { errorEl, showErr, hideErr } = createError({});

    const playBtn = createCtaBtn("setup_play", () => {
        const selected = difficultyGrp.querySelector(`.${CONST.CLASS.ACTIVE_BTN}`);
        if (!selected) {
            return showErr("select_Difficulty");
        }

        const difficulty = (selected.textContent?.toUpperCase() as AIDifficulty) || "MEDIUM";
        hideErr();

        const { controller } = gameStore.get();
        if (!controller) {
            return showErr("initialize_controller");
        }
        gameStore.update({ playerNames: [p1.value, "The AI"] });
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
        errorEl,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const localMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("setup_play_local"));

    const line = createSetupLine();

    const playerLabel = createBodyText("enter_names");

    const p1 = createInput("name_player");
    const p2 = createInput("name_player");
    const playersSection = createEl("div", "flex flex-col space-y-4 w-full", {
        children: [playerLabel, p1, p2],
    });

    const { errorEl, showErr, hideErr } = createError({});

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
        gameStore.update({ playerNames: [player1, player2] });
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
        errorEl,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const setParticipants = (ctn: HTMLElement, playerAmount: number) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("start_tournament"));

    const line = createSetupLine();

    const { errorEl, showErr, hideErr } = createError({});

    const playerInputs: HTMLInputElement[] = [];
    for (let i = 0; i < playerAmount; i++) {
        const translationKey = `name_player` as I18nKey; // Dynamically generate the key
        const playerInput = createInput(translationKey); // Pass the dynamic key to createInput
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
        errorEl,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const tournamentMode = (ctn: HTMLElement) => {
    const { round } = tournamentStore.get();
    if (round !== null) {
        log.error("Tournament already started. Cannot create a new tournament.");
        navigateTo("tournament");
    } else {
        log.debug("Tournament not started. Proceeding to create a new tournament.");
    }
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText(getText("create_tournament"));

    const line = createSetupLine();

    const modeLabel = createBodyText("player_number");

    const modeBtnGrp = createButtonGroup({
        texts: ["4P", "8P"],
        twBtn: "bg-gray-100",
        twSelected: "bg-gray-400",
    });
    const modeSection = createEl("div", "flex flex-col w-full mt-6", {
        children: [modeLabel, modeBtnGrp],
    });

    const { errorEl, showErr, hideErr } = createError({});

    const tournamentCreateBtn = createCtaBtn("start_tournament", () => {
        const mode = modeBtnGrp.querySelector(`.${CONST.CLASS.ACTIVE_BTN}`);
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
        errorEl,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

export const createSetupModal = (): HTMLElement => {
    const title = createTitleText(getText("setup_choose_mode"));

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

    // const gameBtnGrp = createButtonGroup(
    //     (btnLabels as I18nKey[]).map((key) => getText(key)),
    //     btnCallbacks,
    //     "flex-1",
    //     "mt-4"
    // );

    // btnLabels.forEach((key, index) => {
    //     translatableElements[key] = gameBtnGrp.children[index] as HTMLElement;
    // });

    const children = [title, line];

    if (authStore.get().isAuthenticated) {
        const tournamentBtn = createCtaBtn("setup_tournament_mode", tournamentCreateBtnCb);
        children.push(tournamentBtn);
    }

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8", children);
    wrapper.appendChild(section);

    return wrapper;
};
