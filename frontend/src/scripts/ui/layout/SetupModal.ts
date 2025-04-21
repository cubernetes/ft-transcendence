import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { gameStore } from "../../modules/game/game.store";
import { tournamentStart } from "../../modules/tournament/tournament.create";
import { sendGameStart } from "../../modules/ws/ws.service";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createError } from "../components/Error";
import { createReturnButton } from "../components/ReturnButton";
import { createSectionContainer } from "../components/SectionContainer";
import { createBodyText, createTitleText } from "../components/Text";

const createSetupLine = () => createEl("hr", "border-t-2 border-dotted border-white mb-6");

const createCtaBtn = (text: string, cb: () => void): HTMLButtonElement => {
    return createButton(
        text,
        "mt-8 p-4 bg-red-500 text-white text-2xl hover:bg-red-600 w-full",
        cb
    );
};

const createDifficultyGroup = () => {
    const label = createBodyText("Difficulty");
    const btns = createButtonGroup(["Easy", "Medium", "Hard"], []);
    const difficultyGrp = createEl("div", "flex flex-col w-full mt-6", {
        children: [label, btns],
    });
    return difficultyGrp;
};

const createInput = (placeholder: string) =>
    createEl("input", "w-full p-2 bg-gray-100 text-black rounded text-xl", {
        attributes: { placeholder },
    });

const aiMode = (ctn: HTMLElement) => {
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("Play AI");
    const line = createSetupLine();
    const difficultyGrp = createDifficultyGroup();
    const { errorDiv, showErr, hideErr } = createError();

    const playBtnCb = () => {
        const selected = difficultyGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!selected) {
            return showErr("Please select a difficulty.");
        }

        const difficulty = selected.textContent?.toUpperCase() || "MEDIUM";
        hideErr();

        // Get the game controller and start AI game
        const { controller } = gameStore.get();
        if (!controller) {
            return showErr("Game controller not initialized.");
        }

        // // Navigate to AI game page using hash routing
        // window.location.hash = "aigame";

        // // Start the game after a small delay to ensure page rendering is complete
        // setTimeout(() => {
        //     controller.startGame("ai", undefined, { aiDifficulty: difficulty });
        // }, 100);
    };

    const playBtn = createCtaBtn("Play", playBtnCb);

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
    const title = createTitleText("Play Local");
    const line = createSetupLine();

    // Player Section
    const playerLabel = createBodyText("Enter player names:");
    const p1 = createInput("Name Player1");
    const p2 = createInput("Name Player2");
    const playersSection = createEl("div", "flex flex-col space-y-4 w-full", {
        children: [playerLabel, p1, p2],
    });

    // const difficultyGrp = createDifficultyGroup();
    const { errorDiv, showErr, hideErr } = createError();

    const playBtnCb = () => {
        const player1 = p1.value.trim();
        const player2 = p2.value.trim();
        // const difficulty = difficultyGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!player1 || !player2) {
            return showErr("Please enter names for both players.");
        }
        // if (!difficulty) {
        //     return showErr("Please select a difficulty.");
        // }

        const gameData = {
            player1,
            player2,
            // difficulty: difficulty.textContent?.toLowerCase(),
        };
        hideErr();
        navigateTo("localgame");
        window.log.debug(
            "Navigated to localgame via navigateTo(localgame) with gameData:",
            gameData
        );
    };
    const playBtn = createCtaBtn("Play", playBtnCb);

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8 items-center relative", [
        returnBtn,
        title,
        line,
        playersSection,
        // difficultyGrp,
        playBtn,
        errorDiv,
    ]);

    ctn.innerHTML = "";
    ctn.appendChild(section);
};

const setParticipants = (ctn: HTMLElement, playerAmount: number) => {
    //TODO: Return should go to the previous step rather than the SetupModal.
    const returnBtn = createReturnButton(ctn, createSetupModal());
    const title = createTitleText("Start tournament");
    const line = createSetupLine();

    const { errorDiv, showErr, hideErr } = createError();

    const playerInputs: HTMLInputElement[] = [];
    for (let i = 0; i < playerAmount; i++) {
        const playerInput = createInput(`Name Player${i + 1}`);
        playerInputs.push(playerInput);
    }

    const participantsBtnCb = () => {
        for (let i = 0; i < playerAmount; i++) {
            const playerInput = playerInputs[i];
            if (!playerInput.value.trim()) {
                return showErr(`Please enter a name for Player ${i + 1}.`);
            }
        }

        hideErr();
        window.log.debug(`Tournament Start Data: ${playerInputs}`);
        tournamentStart(playerInputs);
    };

    const tournamentCreateBtn = createCtaBtn("Start Tournament", participantsBtnCb);

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
    const title = createTitleText("Create a tournament");
    const line = createSetupLine();

    const modeLabel = createBodyText("Player Number");
    const modeBtnGrp = createButtonGroup(["4P", "8P"], []);
    const modeSection = createEl("div", "flex flex-col w-full mt-6", {
        children: [modeLabel, modeBtnGrp],
    });

    const { errorDiv, showErr, hideErr } = createError();

    const participantsBtnCb = () => {
        const mode = modeBtnGrp.querySelector(`.${window.cfg.label.activeBtn}`);
        if (!mode) {
            return showErr("Please select an amount of players.");
        }

        hideErr();
        const playerAmount: number = mode.textContent === "4P" ? 4 : 8;
        window.log.debug(`Tournament Setup Data: ${playerAmount}`);
        setParticipants(ctn, playerAmount);
    };

    const tournamentCreateBtn = createCtaBtn("Create Tournament", participantsBtnCb);

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
    const title = createTitleText("Choose Game Mode");
    const line = createSetupLine();

    const wrapper = createEl("div", "w-full");

    const localBtnCb = () => localMode(wrapper);
    const aiBtnCb = () => aiMode(wrapper);
    const onlineBtnCb = () => navigateTo("onlinegame");
    const tournamentCreateBtnCb = () => tournamentMode(wrapper);

    const btnLabels = ["Local", "AI"];
    const btnCallbacks = [localBtnCb, aiBtnCb];

    if (authStore.get().isAuthenticated) {
        btnLabels.push("Online");
        btnCallbacks.push(onlineBtnCb);
    }

    const gameBtnGrp = createButtonGroup(btnLabels, btnCallbacks, "flex-1", "mt-4");

    const children = [title, line, gameBtnGrp];

    if (authStore.get().isAuthenticated) {
        const tournamentBtn = createButton("Tournament Mode", "w-full mt-4", tournamentCreateBtnCb);
        children.push(tournamentBtn);
    }

    const section = createSectionContainer("w-1/2 bg-gray-300 p-8", children);
    wrapper.appendChild(section);

    return wrapper;
};
