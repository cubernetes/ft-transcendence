import { createEl } from "../../utils/dom-helper";
import { showUserStatus } from "../components/components.loginStatus";

export const createHeader = async (): Promise<HTMLElement> => {
    const a = createEl("a", "text-3xl font-bold", {
        text: "ft-transcendence",
        attributes: { href: "#setup" },
    });

    const title = createEl("h1", "", { children: [a] });

    const navItems = {
        Home: "setup",
        Game: "setup",
        Leaderboard: "leaderboard",
        Profile: "profile",
    };

    const navList = createEl("ul", "flex text-1xl space-x-4");

    for (const [title, hashId] of Object.entries(navItems)) {
        const link = createEl("a", "hover:underline", {
            text: title,
            attributes: { href: `#${hashId}` },
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
        "bg-black/50 p-4 text-white justify-between items-center font-medieval",
        { children: [title, nav] }
    );

    return header;
};
