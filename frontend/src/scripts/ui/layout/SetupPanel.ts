import { twMerge } from "tailwind-merge";
import { AIDifficulty, GameMode, defaultGameConfig } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { gameStore } from "../../modules/game/game.store";
import { createTournamentController } from "../../modules/tournament/tournament.controller";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { sendApiRequest } from "../../utils/api";
import { createEl, replaceChildren } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createContainer } from "../components/Container";
import { createInput } from "../components/Input";
import { createParagraph } from "../components/Paragraph";
import { createStatus } from "../components/Status";
import { createTitle } from "../components/Title";

// #region: Styles
const TW_BASE_BTN = "p-4 text-2xl bg-gray-100 hover:bg-gray-400";
// #endregion

// #region: Components
const createReturnBtn = (ctn: UIContainer, src: UIComponent) =>
    createButton({
        tw: "absolute top-8 left-8 p-2 bg-gray-400 text-black hover:bg-gray-600",
        innerHTML: "&#8617;",
        click: () => replaceChildren(ctn, src),
    });

const createLineHr = () => createEl("hr", "border-t-2 border-dotted border-white mb-6");

const createCtaBtn = (text: string, click: () => void) =>
    createButton({
        text,
        tw: twMerge(TW_BASE_BTN, "w-full mt-8 bg-red-500 text-white hover:bg-red-600"),
        click,
    });

const createDifficultyGrp = () => {
    const label = createParagraph({ text: "difficulty" });
    const btns = createButtonGroup({
        texts: ["easy", "medium", "hard"],
        twSelected: "bg-gray-400",
        twBtn: twMerge(TW_BASE_BTN, "text-xl p-2"),
        twCtn: "space-x-4 mt-4",
    });

    const difficultyGrp = createEl("div", "flex flex-col w-full mt-6", {
        children: [label, btns],
    });

    return difficultyGrp;
};

const createInputEl = (ph: string) =>
    createInput({ ph, tw: "w-full p-2 bg-gray-100 text-black rounded text-xl" }); // TODO: Check tw

// #endregion

// #region: Panels

const createBasePanel = (ctn: UIContainer): UIComponent => {
    const titleEl = createTitle({ text: "setup_choose_mode" });
    const lineHr = createLineHr();

    const baseBtnLabels = ["setup_local", "setup_ai"];
    const baseBtnCbs = [() => switchModePanel(ctn, "local"), () => switchModePanel(ctn, "ai")];

    if (authStore.get().isAuthenticated) {
        baseBtnLabels.push("setup_online");
        baseBtnCbs.push(() => switchModePanel(ctn, "online"));
    }

    const baseBtnGrp = createButtonGroup({
        texts: baseBtnLabels,
        cbs: baseBtnCbs,
        twSelected: "bg-gray-400",
        twBtn: TW_BASE_BTN,
        twCtn: "space-x-4 mt-4 justify-center",
    });

    const basePanel = [titleEl, lineHr, baseBtnGrp];

    if (authStore.get().isAuthenticated) {
        // TODO: Check: Any reason why log in is needed to play tournament?
        const tournamentBtn = createCtaBtn("setup_tournament_mode", () =>
            switchModePanel(ctn, "tournament")
        );
        basePanel.push(tournamentBtn);
    }

    return basePanel;
};

const createLocalPanel = (ctn: UIContainer): UIComponent => {
    const returnBtn = createReturnBtn(ctn, createBasePanel(ctn));
    const titleEl = createTitle({ text: "setup_play_local" });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const playerLabel = createParagraph({ text: "enter_names" });
    const localP1 = createInput({ ph: "name_player" });
    const localP2 = createInput({ ph: "name_player" });
    const playersSection = createEl("div", "flex flex-col space-y-4 w-full", {
        children: [playerLabel, localP1, localP2],
    });

    const localPlayBtn = createCtaBtn("setup_play", () => {
        const player1 = localP1.value.trim();
        const player2 = localP2.value.trim();
        if (!player1 || !player2 || player1 === player2) return showErr("player_names_required");

        const { controller } = gameStore.get();
        if (!controller) return showErr("initialize_controller");

        gameStore.update({ playerNames: [player1, player2] });
        controller.startGame("local", {
            ...defaultGameConfig,
            playTo: 5,
        });
    });

    return [returnBtn, titleEl, lineHr, playersSection, localPlayBtn, statusEl];
};

const createAiPanel = (ctn: UIContainer): UIComponent => {
    const returnBtn = createReturnBtn(ctn, createBasePanel(ctn));
    const titleEl = createTitle({ text: "play_ai" });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const aiP1 = createInput({ ph: "name_player" }); // TODO: should you be able to name yourself
    const { displayName } = authStore.get();
    if (displayName) {
        aiP1.value = displayName;
    }

    const difficultyGrp = createDifficultyGrp();
    const aiPlayBtn = createCtaBtn("setup_play", () => {
        const selected = difficultyGrp.querySelector(`.${CONST.CLASS.ACTIVE_BTN}`);
        if (!selected) return showErr("select_Difficulty");

        const difficulty = (selected.textContent?.toUpperCase() as AIDifficulty) || "MEDIUM";
        const { controller } = gameStore.get();
        if (!controller) return showErr("initialize_controller");

        gameStore.update({ playerNames: [aiP1.value, "The AI"] });
        controller.startGame("ai", {
            ...defaultGameConfig,
            playTo: 5,
            aiDifficulty: difficulty,
            aiMode: true,
        });
    });

    return [returnBtn, titleEl, lineHr, aiP1, difficultyGrp, aiPlayBtn, statusEl];
};

const createOnlinePanel = (ctn: UIContainer): UIComponent => {
    const returnBtn = createReturnBtn(ctn, createBasePanel(ctn));
    const titleEl = createTitle({ text: "setup_online" });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const createLobbyBtn = createCtaBtn("create_lobby", async () => {
        const result = await sendApiRequest.post(`${CONST.API.LOBBY}/create`);

        if (result.isErr()) {
            showErr(result.error);
            const devHack = createButton({
                text: "LEAVE (dev hack)",
                tw: "mt-2 p-2 bg-white hover:bg-gray-400",
                click: () => {
                    sendApiRequest.post(`${CONST.API.LOBBY}/leave`);
                    switchModePanel(ctn, "online");
                },
            });
            return replaceChildren(ctn, [returnBtn, statusEl, devHack]);
        } // TODO: handle error cleanly
        if (!result.value.success) return []; // Never, fix type later

        const { lobbyId } = result.value.data;
        gameStore.update({ lobbyId, lobbyHost: true });
        navigateTo("lobby");
    });
    const joinLobbyBtn = createCtaBtn("join_lobby", () => switchModePanel(ctn, "join"));
    const onlineBtnGrp = createEl("div", "flex flex-col space-y-4 items-center mt-4", {
        children: [createLobbyBtn, joinLobbyBtn],
    }); // TODO: refactor to use the correct function

    return [returnBtn, titleEl, lineHr, onlineBtnGrp];
};

const createTournamentPanel = (ctn: UIContainer): UIComponent => {
    // TODO: see what this logic is checking
    const { round } = tournamentStore.get();
    if (round) {
        log.warn("Tournament already started. Cannot create a new tournament.");
        navigateTo("tournament");
    }

    const returnBtn = createReturnBtn(ctn, createBasePanel(ctn));
    const titleEl = createTitle({ text: "create_tournament" });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const modeLabel = createParagraph({ text: "player_number" });
    const modeBtnGrp = createButtonGroup({
        texts: ["4P", "8P"],
        twBtn: twMerge(TW_BASE_BTN, "text-xl p-2"),
        twSelected: "bg-gray-400",
        twCtn: "space-x-4 mt-4",
    });
    const modeSection = createEl("div", "flex flex-col w-full mt-6", {
        children: [modeLabel, modeBtnGrp],
    });

    const tournamentCreateBtn = createCtaBtn("start_tournament", () => {
        const mode = modeBtnGrp.querySelector(`.${CONST.CLASS.ACTIVE_BTN}`);
        if (!mode) return showErr("select_player_amount");

        const playerCount = mode.textContent === "4P" ? 4 : 8;
        return replaceChildren(ctn, createParticipantPanel(ctn, playerCount));
    });

    return [returnBtn, titleEl, lineHr, modeSection, tournamentCreateBtn, statusEl];
};

const createParticipantPanel = (ctn: UIContainer, length: number): UIComponent => {
    const returnBtn = createReturnBtn(ctn, createTournamentPanel(ctn));
    const title = createTitle({ text: "start_tournament" });
    const line = createLineHr();
    const { statusEl, showErr } = createStatus();

    const playerInputs = Array.from({ length }).map(() => createInput({ ph: "name_player" }));
    const inputsCtn = createContainer({
        tw: "grid grid-cols-1 md:grid-cols-2 gap-4 w-full",
        children: playerInputs,
    });

    // TODO: should be in tournament service or controller
    const tournamentStartBtn = createCtaBtn("start_tournament", () => {
        const players = new Set<string>();
        for (let i = 0; i < length; i++) {
            const player = playerInputs[i].value.trim();
            if (!player || players.has(player)) {
                return showErr("player_names_required");
            }
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
    const returnBtn = createReturnBtn(ctn, createOnlinePanel(ctn));
    const titleEl = createTitle({ text: "join_lobby" });
    const lineHr = createLineHr();
    const { statusEl, showErr } = createStatus();

    const lobbyIdInput = createEl("input", "p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: { placeholder: "game_id" },
    });

    const joinBtn = createButton({
        text: "Join",
        tw: twMerge(TW_BASE_BTN, "ml-4 px-3 py-1 bg-white hover:bg-blue-600 transition-all"),
        click: async () => {
            const lobbyId = lobbyIdInput.value.trim();
            if (!lobbyId) return showErr("Lobby ID is required.");

            const { controller } = gameStore.get();
            if (!controller) return showErr("Controller not initilized");

            const tryJoin = await sendApiRequest.post(`${CONST.API.LOBBY}/join/${lobbyId}`);
            if (tryJoin.isErr()) return showErr(tryJoin.error);

            gameStore.update({ lobbyId, lobbyHost: false });
            navigateTo("lobby");
        },
    });

    const infoEl = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
        text: "Enter the Game ID to join your friend's game.",
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
