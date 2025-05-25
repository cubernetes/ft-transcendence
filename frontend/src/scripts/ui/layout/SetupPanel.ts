import { twMerge } from "tailwind-merge";
import { AIDifficulty, CreatePayload, GameMode, defaultGameConfig } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { gameStore } from "../../modules/game/game.store";
import { getText } from "../../modules/locale/locale.utils";
import { createTournamentController } from "../../modules/tournament/tournament.controller";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { sendApiRequest } from "../../utils/api";
import { createEl, replaceChildren } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createContainer } from "../components/Container";
import { createHeading } from "../components/Heading";
import { createInput } from "../components/Input";
import { createParagraph } from "../components/Paragraph";
import { createStatus } from "../components/Status";

// #region: Styles
const TW_BASE_BTN = `p-2 ${CONST.FONT.BODY_SM} bg-gray-100 hover:bg-gray-400`;
// #endregion

// #region: Components
const createReturnBtn = (ctn: UIContainer, src: UIComponent) =>
    createButton({
        tw: "absolute top-8 left-4 pr-1 pl-1 bg-gray-400 text-black hover:bg-gray-600",
        innerHTML: "&#8617;",
        click: () => replaceChildren(ctn, src),
    });

const createLineHr = () => createEl("hr", "border-t-2 border-dotted border-white mb-6");

const createCtaBtn = (text: string, click: () => void, tw = "") =>
    createButton({
        text,
        tw: twMerge(TW_BASE_BTN, "w-full mt-4 bg-red-500 text-white hover:bg-red-600", tw),
        click,
    });
// #endregion

// #region: Panels

const createBasePanel = (ctn: UIContainer): UIComponent => {
    // Get I18N keys needed from constants
    const { CHOOSE_GAME_MODE, LOCAL, AI, ONLINE, CREATE_TOURNAMENT } = CONST.TEXT;

    const titleEl = createHeading({ text: CHOOSE_GAME_MODE });
    const lineHr = createLineHr();

    const baseBtnLabels = [LOCAL, AI];
    const baseBtnCbs = [() => switchModePanel(ctn, "local"), () => switchModePanel(ctn, "ai")];

    if (authStore.get().isAuthenticated) {
        baseBtnLabels.push(ONLINE);
        baseBtnCbs.push(() => switchModePanel(ctn, "online"));
    }

    const baseBtnGrp = createButtonGroup({
        texts: baseBtnLabels,
        cbs: baseBtnCbs,
        twSelected: "bg-gray-400",
        twBtn: TW_BASE_BTN,
        twCtn: "space-x-4 mt-4 justify-center",
    });

    const basePanel: UIComponent = [titleEl, lineHr, baseBtnGrp];

    if (authStore.get().isAuthenticated) {
        const tournamentBtn = createCtaBtn(CREATE_TOURNAMENT, () =>
            switchModePanel(ctn, "tournament")
        );
        basePanel.push(tournamentBtn);
    }

    return basePanel;
};

const createLocalPanel = (ctn: UIContainer): UIComponent => {
    // Get I18N keys needed from constants
    const {
        LOCAL,
        ENTER_PLAYER_NAMES,
        PLAY,
        PLAYER_NAMES_REQUIRED,
        INIT_ERROR,
        NAME_PLAYER,
        PLAYER_NAMES_DUPLICATE,
    } = CONST.TEXT;

    const returnBtn = createReturnBtn(ctn, createBasePanel(ctn));
    const titleEl = createHeading({ text: LOCAL });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const playerLabel = createParagraph({ text: ENTER_PLAYER_NAMES });
    const localP1 = createInput({ ph: NAME_PLAYER, i18nVars: { i: 1 } });
    const { displayName } = authStore.get();
    if (displayName) {
        localP1.value = displayName;
    }
    const localP2 = createInput({ ph: NAME_PLAYER, i18nVars: { i: 2 } });
    const playersSection = createEl("div", "flex flex-col space-y-4 w-full", {
        children: [playerLabel, localP1, localP2],
    });

    const localPlayBtn = createCtaBtn(PLAY, () => {
        const player1 = localP1.value.trim();
        const player2 = localP2.value.trim();
        if (!player1 || !player2) return showErr(PLAYER_NAMES_REQUIRED);
        if (player1 === player2) return showErr(PLAYER_NAMES_DUPLICATE);

        const { controller } = gameStore.get();
        if (!controller) return showErr(INIT_ERROR);

        gameStore.update({ playerNames: [player1, player2] });
        controller.startGame("local", {
            ...defaultGameConfig,
            playTo: 5,
        });
    });

    return [returnBtn, titleEl, lineHr, playersSection, localPlayBtn, statusEl];
};

const createAiPanel = (ctn: UIContainer): UIComponent => {
    // Get I18N keys needed from constants
    const {
        AI,
        INIT_ERROR,
        NAME_PLAYER,
        PLAY,
        DIFFICULTY,
        DIFFICULTY_REQUIRED,
        PLAYER_NAMES_REQUIRED,
    } = CONST.TEXT;
    const { EASY, MEDIUM, HARD } = CONST.TEXT;

    const returnBtn = createReturnBtn(ctn, createBasePanel(ctn));
    const titleEl = createHeading({ text: AI });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const aiP1 = createInput({ ph: NAME_PLAYER, i18nVars: { i: 1 } });
    const { displayName } = authStore.get();
    if (displayName) {
        aiP1.value = displayName;
    }

    // Difficulty button group
    const labelEl = createParagraph({ text: DIFFICULTY, tw: "text-left" });
    const btnGrp = createButtonGroup({
        texts: [EASY, MEDIUM, HARD],
        twSelected: "bg-gray-400",
        twBtn: twMerge(TW_BASE_BTN, "p-2"),
        twCtn: "space-x-4 mt-4",
    });
    const difficultyGrp = createEl("div", "flex flex-col w-full mt-6", {
        children: [labelEl, btnGrp],
    });

    const aiPlayBtn = createCtaBtn(PLAY, () => {
        const selected = difficultyGrp.querySelector(`.${CONST.CLASS.ACTIVE_BTN}`);
        if (!aiP1.value.trim()) return showErr(PLAYER_NAMES_REQUIRED);
        if (!selected) return showErr(DIFFICULTY_REQUIRED);

        const aiDifficulty = selected
            .getAttribute(CONST.ATTR.I18N_TEXT)!
            .toUpperCase() as AIDifficulty;

        const { controller } = gameStore.get();
        if (!controller) return showErr(INIT_ERROR);

        gameStore.update({ playerNames: [aiP1.value, getText(AI)] });
        controller.startGame("ai", {
            ...defaultGameConfig,
            playTo: 5,
            aiDifficulty,
            aiMode: true,
        });
    });

    return [returnBtn, titleEl, lineHr, aiP1, difficultyGrp, aiPlayBtn, statusEl];
};

const createOnlinePanel = (ctn: UIContainer): UIComponent => {
    // Get I18N keys needed from constants
    const { ONLINE, CREATE_LOBBY, JOIN_LOBBY } = CONST.TEXT;

    const returnBtn = createReturnBtn(ctn, createBasePanel(ctn));
    const titleEl = createHeading({ text: ONLINE });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const createLobbyBtn = createCtaBtn(
        CREATE_LOBBY,
        async () => {
            const res = await sendApiRequest.post<undefined, CreatePayload>(CONST.API.CREATE_LOBBY);

            if (res.isErr()) return showErr(res.error);

            const { lobbyId } = res.value;
            gameStore.update({ lobbyId, lobbyHost: true });
            navigateTo("lobby");
        },
        "mt-2"
    );
    const joinLobbyBtn = createCtaBtn(JOIN_LOBBY, () => switchModePanel(ctn, "join"));

    const buttonCtn = createContainer({
        tw: "flex flex-col space-y-4 items-center mt-4",
        children: [createLobbyBtn, joinLobbyBtn],
    });

    return [returnBtn, titleEl, lineHr, buttonCtn, statusEl];
};

const createTournamentPanel = (ctn: UIContainer): UIComponent => {
    const { round } = tournamentStore.get();
    if (round) {
        log.warn("Tournament already started. Cannot create a new tournament.");
        navigateTo("tournament");
        return [];
    }

    // Get I18N keys needed from constants
    const { TOURNAMENT, START_TOURNAMENT, NUMBER_OF_PLAYERS } = CONST.TEXT;

    const returnBtn = createReturnBtn(ctn, createBasePanel(ctn));
    const titleEl = createHeading({ text: TOURNAMENT });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const modeLabel = createParagraph({ text: NUMBER_OF_PLAYERS });
    const modeBtnGrp = createButtonGroup({
        texts: ["4P", "8P"],
        twBtn: twMerge(TW_BASE_BTN, "p-2"),
        twSelected: "bg-gray-400",
        twCtn: "space-x-4 mt-4",
    });
    const modeSection = createEl("div", "flex flex-col w-full mt-6", {
        children: [modeLabel, modeBtnGrp],
    });

    const tournamentCreateBtn = createCtaBtn(START_TOURNAMENT, () => {
        const mode = modeBtnGrp.querySelector(`.${CONST.CLASS.ACTIVE_BTN}`);
        if (!mode) return showErr("select_player_amount");

        const playerCount = mode.textContent === "4P" ? 4 : 8;
        return replaceChildren(ctn, createParticipantPanel(ctn, playerCount));
    });

    return [returnBtn, titleEl, lineHr, modeSection, tournamentCreateBtn, statusEl];
};

const createParticipantPanel = (ctn: UIContainer, length: number): UIComponent => {
    // Get I18N keys needed from constants
    const { PLAYER_NAMES_REQUIRED, PLAYER_NAMES_DUPLICATE, NAME_PLAYER, START_TOURNAMENT } =
        CONST.TEXT;

    const returnBtn = createReturnBtn(ctn, createTournamentPanel(ctn));
    const title = createHeading({ text: START_TOURNAMENT });
    const line = createLineHr();
    const { statusEl, showErr } = createStatus();

    const playerInputs = Array.from({ length }).map((_, i) =>
        createInput({ ph: NAME_PLAYER, i18nVars: { i: i + 1 } })
    );
    const inputsCtn = createContainer({
        tw: "grid grid-cols-1 md:grid-cols-2 gap-4 w-full",
        children: playerInputs,
    });

    const tournamentStartBtn = createCtaBtn(START_TOURNAMENT, () => {
        const players = new Set<string>();
        for (let i = 0; i < length; i++) {
            const player = playerInputs[i].value.trim();
            if (!player) return showErr(PLAYER_NAMES_REQUIRED);
            if (players.has(player)) return showErr(PLAYER_NAMES_DUPLICATE);

            players.add(player);
        }

        const controller = createTournamentController([...players]);
        tournamentStore.update({ controller });
        controller.startTournament();
        navigateTo("tournament");
    });

    return [returnBtn, title, line, inputsCtn, tournamentStartBtn, statusEl];
};

const createJoinPanel = (ctn: UIContainer): UIComponent => {
    // Get I18N keys needed from constants
    const { JOIN_LOBBY, ENTER_LOBBY_ID, JOIN, INIT_ERROR, LOBBY_ID_REQUIRED } = CONST.TEXT;

    const returnBtn = createReturnBtn(ctn, createOnlinePanel(ctn));
    const titleEl = createHeading({ text: JOIN_LOBBY });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const lobbyIdInput = createInput({
        ph: ENTER_LOBBY_ID,
        tw: "p-2 bg-gray-100 text-black rounded",
    });

    const joinBtn = createButton({
        text: JOIN,
        tw: twMerge(TW_BASE_BTN, "mt-4 px-3 py-1 bg-white hover:bg-blue-600 transition-all"),
        click: async () => {
            const lobbyId = lobbyIdInput.value.trim();
            if (!lobbyId) return showErr(LOBBY_ID_REQUIRED);

            const { controller } = gameStore.get();
            if (!controller) return showErr(INIT_ERROR);

            const tryJoin = await sendApiRequest.post(`${CONST.API.JOIN}/${lobbyId}`);
            if (tryJoin.isErr()) return showErr(tryJoin.error);

            gameStore.update({ lobbyId, lobbyHost: false });
            navigateTo("lobby");
        },
    });

    const infoEl = createParagraph({
        text: "Enter the Game ID to join your friend's game.",
        tw: "text-gray-700 mt-4",
    });

    return [returnBtn, titleEl, lineHr, lobbyIdInput, joinBtn, infoEl, statusEl];
};

// #region: Components

export const switchModePanel = async (ctn: UIContainer, mode: "base" | "join" | GameMode) => {
    switch (mode) {
        case "base":
            return replaceChildren(ctn, createBasePanel(ctn));
        case "local":
            return replaceChildren(ctn, createLocalPanel(ctn));
        case "ai":
            return replaceChildren(ctn, createAiPanel(ctn));
        case "online":
            return replaceChildren(ctn, createOnlinePanel(ctn));
        case "tournament":
            return replaceChildren(ctn, createTournamentPanel(ctn));
        case "join":
            return replaceChildren(ctn, createJoinPanel(ctn));
    }
};
