import { logout } from "../../modules/auth/auth.service";
import { getText } from "../../modules/locale/locale.utils";

export const appendUserStatus = (container: HTMLElement, username: string) => {
    // Create status wrapper
    const statusWrapper = document.createElement("div");
    statusWrapper.className =
        "absolute items-center justify-between bg-gray-100 rounded p-2 shadow-sm right-4 top-4";

    // TODO: Fetch profile pic and display
    // TODO: make name clickable to profile page

    // User display name
    const userNameEl = document.createElement("span");
    userNameEl.textContent = username;
    userNameEl.className = "text-gray-700 text-sm";

    // Logout button
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = getText("logout");
    logoutBtn.className =
        "ml-4 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded focus:outline-none";

    logoutBtn.onclick = logout;

    // Append elements to the wrapper
    statusWrapper.appendChild(userNameEl);
    statusWrapper.appendChild(logoutBtn);
    container.append(statusWrapper);
};
