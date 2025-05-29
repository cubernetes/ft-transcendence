import { navigateTo } from "../../global/router";
import { authStore } from "../../modules/auth/auth.store";
import { gameStore } from "../../modules/game/game.store";
import { sendGameStart } from "../../modules/ws/ws.service";
import { wsStore } from "../../modules/ws/ws.store";
import { sendApiRequest } from "../../utils/api";
import { createEl } from "../../utils/dom-helper";
import { createArcadeWrapper } from "../components/ArcadeWrapper";
import { createCopyButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createContainer } from "../components/Container";
import { createHeading } from "../components/Heading";
import { createInput } from "../components/Input";
import { createParagraph } from "../components/Paragraph";
import { createStatus } from "../components/Status";

export const createLobbyPage = (): UIComponent => {
    const { ID_INV } = CONST.TEXT;
    const { lobbyId, lobbyHost, playerNames, playTo } = gameStore.get();

    log.debug("Create lobby page???");
    log.debug(gameStore.get());
    log.debug(wsStore.get());

    const titleEl = createHeading({ text: "Lobby" });
    const lineHr = createEl("hr", "border-t-2 border-dotted border-white mb-6");
    const { statusEl, showErr, showOk } = createStatus();

    const infoEl = createParagraph({
        tw: `${CONST.FONT.BODY_XS} text-gray-700 font-medium mt-1`,
        text: ID_INV,
    });

    // Lobby Id
    const lobbyIdLabelEl = createParagraph({ text: "ID: ", tw: "text-gray-600 mr-2" });

    const lobbyIdValueEl = createEl(
        "code",
        "text-blue-800 font-semibold bg-white px-2 py-1 rounded shadow-sm",
        { text: lobbyId }
    );

    const copyBtn = createCopyButton(lobbyId);

    const lobbyIdCtn = createContainer({
        tw: "flex items-center justify-center gap-2 mt-2 p-3 bg-gray-200 rounded-lg shadow-inner",
        children: [lobbyIdLabelEl, lobbyIdValueEl, copyBtn],
    });

    // Players
    const player1P = createParagraph({
        text: lobbyHost ? authStore.get().displayName! : playerNames[0],
        id: CONST.ID.LOBBY_P1,
        tw: "text-gray-700 font-medium mt-2 shadow-md bg-white p-2 w-full mr-2",
    });

    const player2P = createParagraph({
        text: !playerNames[1] || playerNames[1] == "" ? "Waiting" : playerNames[1],
        id: CONST.ID.LOBBY_P2,
        tw: "text-gray-700 font-medium mt-2 shadow-md bg-gray-200 p-2 w-full ml-2",
    });

    const playerCtn = createContainer({
        id: CONST.ID.LOBBY_CTN,
        tw: "flex justify-evenly items-center",
        children: [player1P, player2P],
    });

    // Config
    const playToLabelEl = createParagraph({ text: "Play to" });
    const playToInput = createInput({
        type: "number",
        ph: "Enter a number",
        tw: "h-8 w-1/2 p-2",
        id: CONST.ID.CFG_PLAYTO,
    });
    playToInput.min = "1";
    playToInput.max = "21";
    playToInput.value = String(playTo);

    const configCtn = createContainer({
        children: [playToLabelEl, playToInput],
        tw: "flex justify-evenly items-center mt-4 mx-10",
    });

    const updateBtnCb = async () => {
        const tryUpdate = await sendApiRequest.post(CONST.API.UPDATE_LOBBY, {
            playTo: Number(playToInput.value),
        });
        if (tryUpdate.isErr()) return showErr(tryUpdate.error);

        showOk("Successfully updated");
    };

    const startBtnCb = () => {
        const { controller, playerNames } = gameStore.get();
        if (!controller) return;

        // Not a great way to guard against when only one player is in the lobby
        if (!playerNames[1]) return showErr("Not enough players");

        sendGameStart();
        controller.startGame("online");
    };

    const leaveBtnCb = () => {
        sendApiRequest.post(CONST.API.LEAVE);
        navigateTo(CONST.ROUTE.PLAY);
    };

    const { UPDATE, START, LEAVE } = CONST.TEXT;
    const ctaBtnGrp = createButtonGroup({
        texts: [UPDATE, START, LEAVE],
        cbs: [updateBtnCb, startBtnCb, leaveBtnCb],
        twBtn: "p-2 shadow-md",
        twCtn: "flex justify-evenly items-center mt-4",
        twBtnSpecific: ["bg-green-500", "bg-blue-300", "bg-red-300"],
    });

    // Disable options for guest
    if (!lobbyHost) {
        playToInput.disabled = true;
        playToInput.classList.add("cursor-not-allowed");

        const updateBtn = ctaBtnGrp.children[0] as HTMLButtonElement;
        const startBtn = ctaBtnGrp.children[1] as HTMLButtonElement;
        updateBtn.disabled = true;
        updateBtn.classList.add("cursor-not-allowed");

        startBtn.disabled = true;
        startBtn.classList.add("cursor-not-allowed");
    }

    const container = createContainer({
        tag: "main",
        tw: `${CONST.FONT.BODY_XS} w-full p-8 items-center relative ${CONST.STYLES.CONTAINER}`,
        children: [titleEl, lineHr, infoEl, lobbyIdCtn, playerCtn, configCtn, ctaBtnGrp, statusEl],
    });

    const unsubscribeGameStore = gameStore.subscribe(({ playerNames, playTo }) => {
        player1P.textContent = playerNames[0];
        player2P.textContent = playerNames[1] ?? "Waiting";

        playToInput.value = String(playTo);
    });

    container.addEventListener("destroy", () => {
        unsubscribeGameStore();

        // Always leave when route away from lobby page
        sendApiRequest.post(CONST.API.LEAVE);
    });
    return createArcadeWrapper([container]);
};
