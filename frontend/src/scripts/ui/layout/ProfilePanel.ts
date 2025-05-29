import { PersonalUser } from "@darrenkuro/pong-core";
import { authStore } from "../../modules/auth/auth.store";
import { createAvatar } from "../components/Avatar";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createContainer } from "../components/Container";
import { createHeading } from "../components/Heading";
import { createParagraph } from "../components/Paragraph";
import { createTotpModal } from "./TotpModal";
import { createUpdateModal } from "./UpdateModal";

export const createProfilePanel = (user: PersonalUser): UIComponent => {
    // Get I18N keys needed from constants
    const {
        PROFILE,
        USERNAME,
        DISPLAY_NAME,
        PASSWORD,
        UPDATE,
        DISABLE,
        ENABLE,
        RANK,
        GAMES_PLAYED,
        WINS,
        LOSSES,
    } = CONST.TEXT;

    // Title element
    const titleEl = createHeading({ text: PROFILE, tw: `${CONST.FONT.H5} mt-4` });

    // User avatar element
    const avatarEl = createAvatar({ src: user.avatarUrl });

    const LABEL_TW = ` ${CONST.FONT.BODY_XS} whitespace-nowrap text-left ml-2 mb-1`;
    // Username
    const usernameLabel = createParagraph({ text: USERNAME, tw: LABEL_TW });
    const usernameEl = createParagraph({ text: user.username });

    // Display name
    const displayNameLabel = createParagraph({ text: DISPLAY_NAME, tw: LABEL_TW });
    const displayNameEl = createParagraph({ text: user.displayName, tw: "cursor-pointer" });
    displayNameEl.onclick = () => createUpdateModal("displayName");
    const unsubscribeAuth = authStore.subscribe(
        ({ displayName }) => (displayNameEl.textContent = displayName ?? "")
    );
    displayNameEl.addEventListener("destroy", unsubscribeAuth);

    // Password
    const passwordLabel = createParagraph({ text: PASSWORD, tw: LABEL_TW });
    const passwordBtn = createButton({
        text: UPDATE,
        tw: "w-full bg-gray-100 hover:bg-gray-400 px-2",
        click: () => createUpdateModal("password"),
    });

    // 2FA
    const totpLabel = createParagraph({ text: "2FA", tw: LABEL_TW });
    const totpOnEl = createButtonGroup({
        texts: [UPDATE, DISABLE],
        cbs: [() => createTotpModal("update"), () => createTotpModal("disable")],
        twBtn: "w-full bg-gray-100 hover:bg-gray-400 px-2",
    });
    const totpOffEl = createButton({
        text: ENABLE,
        click: () => createTotpModal("setup"),
        tw: "w-full bg-gray-100 hover:bg-gray-400 px-2",
    });
    const totpEl = user.totpEnabled ? totpOnEl : totpOffEl;

    // Games played
    const gamesLabel = createParagraph({ text: GAMES_PLAYED, tw: LABEL_TW });
    const gamesEl = createParagraph({ text: String(user.totalGames) });

    // Wins
    const winsLabel = createParagraph({ text: WINS, tw: LABEL_TW });
    const winsEl = createParagraph({ text: String(user.wins) });

    // Losses
    const lossesLabel = createParagraph({ text: LOSSES, tw: LABEL_TW });
    const lossesEl = createParagraph({ text: String(user.losses) });

    // Rank
    const rankLabel = createParagraph({ text: RANK, tw: LABEL_TW });
    const rankEl = createParagraph({ text: String(user.rank) });

    // Containers for styling
    const labelCtn = createContainer({
        tw: `${CONST.FONT.BODY_SM} flex-col w-full font-bold`,
        children: [
            usernameLabel,
            displayNameLabel,
            passwordLabel,
            totpLabel,
            gamesLabel,
            winsLabel,
            lossesLabel,
            rankLabel,
        ],
    });

    const contentCtn = createContainer({
        tw: `${CONST.FONT.BODY_SM} flex-col w-full`,
        children: [
            usernameEl,
            displayNameEl,
            passwordBtn,
            totpEl,
            gamesEl,
            winsEl,
            lossesEl,
            rankEl,
        ],
    });

    const settingCtn = createContainer({
        tw: "flex mx-auto",
        children: [labelCtn, contentCtn],
    });

    // Create left container to include infos and settings
    const leftCtn = createContainer({
        tw: "flex-[3] flex-col",
        children: [titleEl, settingCtn],
    });

    // Create right container to include avartar
    const rightCtn = createContainer({
        tw: "flex-[2] flex justify-center",
        children: [avatarEl],
    });

    // Create the root container for profile panel
    const container = createContainer({
        tag: "section",
        tw: "flex w-full bg-white rounded-lg shadow-md justify-evenly flex-wrap",
        children: [leftCtn, rightCtn],
    });

    return [container];
};
