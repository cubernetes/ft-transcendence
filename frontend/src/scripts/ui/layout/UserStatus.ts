import { logout } from "../../modules/auth/auth.service";
import { getText } from "../../modules/locale/locale.utils";
import { appendChildren } from "../../utils/dom-helper";
import { createLanguageButton } from "./LanguageButton";

export const appendUserStatus = (container: HTMLElement, username: string) => {
    // Create status wrapper
    const statusWrapper = document.createElement("div");
    statusWrapper.className =
        "absolute top-4 right-2 flex items-center justify-between bg-gray-100 rounded p-2 shadow-sm";

    const langBtn = createLanguageButton("static");
    // TODO: Fetch profile pic and display
    // TODO: make name clickable to profile page

    // User display name
    const userNameEl = document.createElement("span");
    userNameEl.textContent = username;
    userNameEl.className = "text-gray-700 text-sm";

    // Logout button
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = getText(CONST.TEXT.LOGOUT);
    logoutBtn.setAttribute(CONST.ATTR.I18N_TEXT, CONST.TEXT.LOGOUT);
    logoutBtn.className =
        "bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded focus:outline-none";

    logoutBtn.onclick = logout;

    // Append elements to the wrapper
    appendChildren(statusWrapper, [userNameEl, langBtn, logoutBtn]);

    container.append(statusWrapper);
};
