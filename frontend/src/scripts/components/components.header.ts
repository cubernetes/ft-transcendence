import { showUserStatus } from "./components.loginStatus";

export const createHeader = async (): Promise<HTMLElement> => {
    const header = document.createElement("header");
    header.className = "bg-black/50 p-4 text-white justify-between items-center font-medieval";

    const title = document.createElement("h1");
    const a = document.createElement("a");
    a.href = "#home";
    a.textContent = "ft-transcendence";
    a.className = "text-3xl font-bold";
    title.appendChild(a);

    const nav = document.createElement("nav");
    nav.className = "flex items-center space-x-6";

    const navItems = {
        Home: "home",
        Game: "game",
        Leaderboard: "leaderboard",
        Profile: "profile",
        Login: "login",
        "2FA Setup": "totpSetup",
    };
    const navList = document.createElement("ul");
    navList.className = "flex text-1xl space-x-4";

    for (const [title, hashId] of Object.entries(navItems)) {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${hashId}`;
        link.textContent = title;
        link.className = "hover:underline";
        li.appendChild(link);
        navList.appendChild(li);
    }

    const loginStatus = document.createElement("li");
    navList.appendChild(loginStatus);

    nav.appendChild(navList);
    header.appendChild(title);
    header.appendChild(nav);

    await showUserStatus(loginStatus);

    return header;
};
