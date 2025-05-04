import { AIDifficulty, GameMode, defaultGameConfig } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { gameStore } from "../../modules/game/game.store";
import { I18nKey } from "../../modules/locale/locale.en";
import { getText } from "../../modules/locale/locale.utils";
import { createTournamentController } from "../../modules/tournament/tournament.controller";
import { tournamentStore } from "../../modules/tournament/tournament.store";
import { createEl, replaceChildren } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createContainer } from "../components/Container";
import { createError } from "../components/Error";
import { createInput } from "../components/Input";
import { createParagraph } from "../components/Paragraph";
import { createReturnButton } from "../components/ReturnButton";
import { createSectionContainer } from "../components/SectionContainer";
import { createTitle } from "../components/Title";

type setupMode = "base" | GameMode;

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
        tw: "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        click,
    });

const createDifficultyGrp = () => {
    const label = createParagraph({ text: "difficulty" });
    const btns = createButtonGroup({
        texts: ["easy", "medium", "hard"],
        twSelected: "bg-gray-400",
        twBtn: "text-xl text-black bg-gray-100 hover:bg-gray-400 p-2",
        twCtn: "space-x-4 mt-4",
    });

    const difficultyGrp = createEl("div", "flex flex-col w-full mt-6", {
        children: [label, btns],
    });

    return difficultyGrp;
};

const createInputEl = (ph: string) =>
    createInput({ ph, tw: "w-full p-2 bg-gray-100 text-black rounded text-xl" });

// #endregion

// const createLobby = (ctn: HTMLElement) => {
//     const returnBtn = createReturnButton(ctn, createSetupModal()); // Warn to leave?
//     const title = createTitle({ text: "create_lobby" });
//     const line = createLineHr();

//     const { username } = authStore.get(); // TODO: get correct payload
//     const creator = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
//         text: `Your Name: ${username || "Anonymous"}`,
//     });

//     // Game ID
//     const gameId = crypto.randomUUID().split("-")[0]; // Replace with backend ID when available
//     const gameIdLabel = createEl("span", "text-gray-600 mr-2");
//     gameIdLabel.textContent = "Game ID:";

//     const gameIdValue = createEl(
//         "code",
//         "text-blue-800 font-semibold text-md bg-white px-2 py-1 rounded shadow-sm"
//     );
//     gameIdValue.textContent = gameId;

//     const copyBtn = createButton({
//         text: "Copy",
//         tw: "ml-4 px-3 py-1 rounded hover:bg-blue-600 transition-all",
//         click: () => {
//             navigator.clipboard.writeText(gameId).then(() => {
//                 copyBtn.textContent = "Copied!";
//                 setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
//             });
//         },
//     });

//     const gameIdContainer = createEl(
//         "div",
//         "flex items-center justify-center gap-2 mt-6 p-3 bg-gray-200 rounded-lg shadow-inner"
//     );
//     gameIdContainer.appendChild(gameIdLabel);
//     gameIdContainer.appendChild(gameIdValue);
//     gameIdContainer.appendChild(copyBtn);

//     const info = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
//         text: "Share this ID with your friends to join your game.",
//     });

//     const section = createSectionContainer(
//         "w-1/2 bg-gray-300 p-8 items-center shaded relative rounded-lg shadow-lg space-y-4",
//         [returnBtn, title, line, creator, gameIdContainer, info]
//     );

//     ctn.innerHTML = "";
//     ctn.appendChild(section);
// };

// const joinLobby = (ctn: HTMLElement) => {
//     const returnBtn = createReturnButton(ctn, createSetupModal());
//     const title = createTitle({ text: "join_lobby" });

//     const line = createLineHr();

//     const username = authStore.get().username;
//     const creator = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
//         text: `Your Name: ${username || "Anonymous"}`,
//     });

//     // Game ID

//     const gameIdInput = createEl("input", "p-2 bg-gray-100 text-black rounded text-xl", {
//         attributes: { placeholder: getText("game_id") },
//     });

//     const joinBtn = createButton({
//         text: "Join",
//         tw: "ml-4 px-3 py-1 rounded hover:bg-blue-600 transition-all",
//         click: () => {
//             const gameId = gameIdInput.value.trim();
//             if (!gameId) {
//                 return log.error("Game ID is required.");
//             }
//             log.debug("Joining game with ID:", gameId);

//             navigateTo("onlinegame");

//             //TODO: Implement the join lobby logic
//             // const { controller } = gameStore.get();
//             // if (!controller) {
//             //     return log.error("Controller not initialized.");
//             // }

//             // controller.joinLobby(gameId);
//             // sendGameStart(gameId);
//         },
//     });

//     const info = createEl("p", "text-lg text-gray-700 font-medium mt-4", {
//         text: "Enter the Game ID to join your friend's game.",
//     });

//     const section = createSectionContainer(
//         "w-1/2 bg-gray-300 p-8 items-center shaded relative rounded-lg shadow-lg space-y-4",
//         [returnBtn, title, line, creator, gameIdInput, joinBtn, info]
//     );

//     ctn.innerHTML = "";
//     ctn.appendChild(section);
// };

const createParticipantPanel = (
    length: number,
    ctn: UIContainer,
    src: UIComponent
): UIComponent => {
    const returnBtn = createReturnBtn(ctn, src);
    const title = createTitle({ text: "start_tournament" });
    const line = createLineHr();
    const { errorEl, showErr } = createError({});

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

    return [returnBtn, title, line, inputsCtn, tournamentStartBtn, errorEl];
};

// TODO: see what this logic is checking
// const createTournamentPanel = () => {
//     const { round } = tournamentStore.get();
//     if (round !== null) {
//         log.error("Tournament already started. Cannot create a new tournament.");
//         navigateTo("tournament");
//     } else {
//         log.debug("Tournament not started. Proceeding to create a new tournament.");
//     }
//     const title = createTitle({ text: "create_tournament" });
// };

export const switchModePanel = (ctn: UIContainer, mode: setupMode) => {
    const title = createTitle({ text: mode }); // TODO: Translation code
    const line = createLineHr();
    const { errorEl, showErr } = createError({});

    // Base panel
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
        twBtn: "text-2xl text-black bg-gray-100 hover:bg-gray-400 p-4",
        twCtn: "space-x-4 mt-4 justify-center",
    });

    const basePanel = [title, line, baseBtnGrp];

    if (authStore.get().isAuthenticated) {
        // TODO: Check: Any reason why log in is needed to play tournament?
        const tournamentBtn = createCtaBtn("setup_tournament_mode", () =>
            switchModePanel(ctn, "tournament")
        );
        basePanel.push(tournamentBtn);
    }

    // Return button
    const returnBtn = createReturnBtn(ctn, basePanel);

    // Local panel
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
    const localPanel = [returnBtn, title, line, playersSection, localPlayBtn, errorEl];

    // Ai mode
    const aiP1 = createInput({ ph: "name_player" }); // TODO: should you name yourself
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

    const aiPanel = [returnBtn, title, line, aiP1, difficultyGrp, aiPlayBtn, errorEl];

    // Online mode
    const createLobbyBtn = createCtaBtn("create_lobby", () => {}); // TODO: Add action
    const joinLobbyBtn = createCtaBtn("join_lobby", () => {});
    const onlineBtnGrp = createEl("div", "flex flex-col space-y-4 items-center mt-4", {
        children: [createLobbyBtn, joinLobbyBtn],
    }); // TODO: refactor to use the correct function
    const onlinePanel = [returnBtn, title, line, onlineBtnGrp];

    // Tournament mode
    const modeLabel = createParagraph({ text: "player_number" });
    const modeBtnGrp = createButtonGroup({
        texts: ["4P", "8P"],
        twBtn: "bg-gray-100",
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
        createParticipantPanel(playerCount, ctn, tournamentPanel);
    });

    const tournamentPanel = [returnBtn, modeSection, tournamentCreateBtn, errorEl];

    switch (mode) {
        case "base":
            return replaceChildren(ctn, basePanel);
        case "local":
            return replaceChildren(ctn, localPanel);
        case "ai":
            return replaceChildren(ctn, aiPanel);
        case "online":
            return replaceChildren(ctn, onlinePanel);
        case "tournament":
            return replaceChildren(ctn, tournamentPanel);
    }
};
