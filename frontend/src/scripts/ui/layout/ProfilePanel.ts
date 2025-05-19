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
    const { PROFILE, USERNAME, DISPLAY_NAME, PASSWORD, UPDATE, DISABLE, ENABLE, RANK } = CONST.TEXT;

    // Title element
    const titleEl = createHeading({ text: PROFILE, tw: "text-4xl mt-4" });

    // User avatar element
    const avatarEl = createAvatar({ src: user.avatarUrl });

    const LABEL_TW = "whitespace-nowrap";

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
    displayNameEl.addEventListener("destory", unsubscribeAuth);

    // Password
    const passwordLabel = createParagraph({ text: PASSWORD, tw: LABEL_TW });
    const passwordBtn = createButton({
        text: UPDATE,
        tw: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
        click: () => createUpdateModal("password"),
    });

    // 2FA
    const totpLabel = createParagraph({ text: "2FA", tw: LABEL_TW });
    const totpOnEl = createButtonGroup({
        texts: [UPDATE, DISABLE],
        cbs: [() => createTotpModal("update"), () => createTotpModal("disable")],
        twBtn: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
    });
    const totpOffEl = createButton({
        text: ENABLE,
        click: () => createTotpModal("setup"),
        tw: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
    });
    const totpEl = user.totpEnabled ? totpOnEl : totpOffEl;

    // Rank
    const rankLabel = createParagraph({ text: RANK, tw: LABEL_TW });
    const rankEl = createParagraph({ text: String(user.rank) });

    // Containers for styling
    const labelCtn = createContainer({
        tw: "flex-col w-full",
        children: [usernameLabel, displayNameLabel, passwordLabel, totpLabel, rankLabel],
    });

    const contentCtn = createContainer({
        tw: "flex-col w-full",
        children: [usernameEl, displayNameEl, passwordBtn, totpEl, rankEl],
    });

    const settingCtn = createContainer({
        tw: "flex mx-auto",
        children: [labelCtn, contentCtn],
    });

    // Create left container to include infos and settings
    const leftCtn = createContainer({
        tw: "w-3/5 flex-col",
        children: [titleEl, settingCtn],
    });

    // Create right container to include avartar
    const rightCtn = createContainer({
        tw: "w-2/5 flex justify-center",
        children: [avatarEl],
    });

    // Create the root container for profile panel
    const container = createContainer({
        tag: "section",
        tw: "flex bg-white rounded-lg shadow-md justify-evenly",
        children: [leftCtn, rightCtn],
    });

    return [container];
};
