import { logout } from "../../modules/auth/auth.service";
import { createEl } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createContainer } from "../components/Container";
import { createLanguageButton } from "./LanguageButton";

export const appendUserStatus = (container: HTMLElement, username: string) => {
    // User display name
    const usernameEl = createEl("span", `text-gray-700 ${CONST.FONT.BODY_XS}`, { text: username });

    const langBtn = createLanguageButton("mb-2 static");

    // Logout button
    const logoutBtn = createButton({
        text: CONST.TEXT.LOGOUT,
        tw: "bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded focus:outline-none",
        click: logout,
    });

    const statusCtn = createContainer({
        tw: "absolute top-4 right-2 flex items-center justify-between bg-gray-100 rounded pl-2 pr-2 shadow-sm",
        children: [usernameEl, langBtn, logoutBtn],
    });

    container.append(statusCtn);
};
