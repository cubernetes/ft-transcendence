import { PersonalUser } from "@darrenkuro/pong-core";
import { getText } from "../../modules/locale/locale.utils";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createButtonGroup } from "../components/ButtonGroup";
import { createContainer } from "../components/Container";
import { createHeading } from "../components/Heading";
import { createParagraph } from "../components/Paragraph";
import { createTotpModal } from "./TotpModal";

export const createProfilePanel = (user: PersonalUser): UIComponent => {
    // TODO: Click, upload
    const avatarEl = createEl("img", "w-64 h-64 rounded-full", {
        attributes: {
            src: user.avatarUrl,
            alt: getText("USER_AVATAR"),
            [CONST.ATTR.I18N_ALT]: "USER_AVATAR",
        },
    });

    const titleEl = createHeading({ text: "your_profile", tw: "text-4xl mt-4" });

    const usernameLabel = createParagraph({ text: "USERNAME", tw: "mr-8" });
    const usernameEl = createParagraph({ text: user.username });

    const displayNameLabel = createParagraph({ text: "DISPLAY_NAME", tw: "mr-8" });
    const DisplayNameEl = createParagraph({ text: user.displayName });

    const passwordLabel = createParagraph({ text: "PASSWORD", tw: "mr-8" });
    const passwordBtn = createButton({
        text: "UPDATE",
        tw: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
        // TODO: click cb
    });

    const totpLabel = createParagraph({ text: "2FA", tw: "mr-8" });
    const totpOnEl = createButtonGroup({
        texts: ["UPDATE", "DISABLE"],
        cbs: [() => createTotpModal("update"), () => createTotpModal("disable")],
        twBtn: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
    });
    const totpOffEl = createButton({
        text: "ENABLE",
        click: () => createTotpModal("setup"),
        tw: "w-full text-xl bg-gray-100 hover:bg-gray-400 px-2",
    });
    const totpEl = user.totpEnabled ? totpOnEl : totpOffEl;

    const rankLabel = createParagraph({ text: "RANK", tw: "mr-8" });
    const rankEl = createParagraph({ text: String(user.rank) });

    const labelCtn = createContainer({
        tw: "flex-col w-full bg-blue-300",
        children: [usernameLabel, displayNameLabel, passwordLabel, totpLabel, rankLabel],
    });

    const contentCtn = createContainer({
        tw: "flex-col w-full bg-yellow-300",
        children: [usernameEl, DisplayNameEl, passwordBtn, totpEl, rankEl],
    });

    const settingCtn = createContainer({
        tw: "flex mx-auto bg-green-300",
        children: [labelCtn, contentCtn],
    });

    // Create left container to include infos and settings
    const leftCtn = createContainer({
        tw: "w-3/5 flex-col bg-red-300",
        children: [titleEl, settingCtn],
    });

    // Create right container to include avartar
    const rightCtn = createContainer({
        tw: "w-2/5 flex justify-center bg-blue-300",
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
