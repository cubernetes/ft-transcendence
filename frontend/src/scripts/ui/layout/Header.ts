import { logout } from "../../modules/auth/auth.service";
import { authStore } from "../../modules/auth/auth.store";
import { createEl } from "../../utils/dom-helper";

const showUserStatus = async (container: HTMLElement): Promise<Boolean> => {
    const loggedUser = authStore.get().username;

    if (!loggedUser) {
        window.log.error("No user logged in.");
        return false;
    }

    // Create status wrapper
    const statusWrapper = document.createElement("div");
    statusWrapper.className =
        "absolute items-center justify-between bg-gray-100 rounded p-2 shadow-sm right-4 top-4";

    // User display name
    const userNameEl = document.createElement("span");
    userNameEl.textContent = `Logged in as ${loggedUser}`;
    userNameEl.className = "text-gray-700 text-sm";

    // Logout button
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.className =
        "ml-4 bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded focus:outline-none";

    logoutBtn.onclick = logout;

    statusWrapper.appendChild(userNameEl);
    statusWrapper.appendChild(logoutBtn);
    container.appendChild(statusWrapper);
    return true;
};

export const createHeader = async (): Promise<HTMLElement> => {
    const anchor = createEl("a", "text-3xl font-bold", {
        text: "ft-transcendence",
        attributes: { href: window.cfg.url.home },
    });
    const title = createEl("h1", "", { children: [anchor] });

    const navItems = {
        Home: window.cfg.url.home,
        Game: "#setup",
        Leaderboard: "#leaderboard",
        Profile: "#profile",
        TOTP: "#totp",
    };

    const navList = createEl("ul", "flex text-1xl space-x-4");

    for (const [title, hashId] of Object.entries(navItems)) {
        const link = createEl("a", "hover:underline", {
            text: title,
            attributes: { href: hashId },
        });
        const li = createEl("li", "", { children: [link] });
        navList.appendChild(li);
    }

    const loginStatus = createEl("li");
    navList.appendChild(loginStatus);
    await showUserStatus(loginStatus); // FIX

    const nav = createEl("nav", "flex items-center space-x-6", { children: [navList] });

    const header = createEl(
        "header",
        "bg-black/50 p-4 text-white justify-between items-center font-medieval hidden",
        { children: [title, nav] }
    );

    return header;
};
