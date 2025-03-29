import { showUserStatus } from "./components.loginStatus";

export const createHeader = async (): Promise<HTMLElement> => {
    const header = document.createElement("header");
    header.className = "bg-red-500 p-4 text-white justify-between items-center font-medieval";

    const title = document.createElement("h1");
    const a = document.createElement("a");
    a.href = "#home";
    a.textContent = "ft-transcendence";
    a.className = "text-2xl font-bold";
    title.appendChild(a);

    const nav = document.createElement("nav");
    nav.className = "flex items-center space-x-6";

    const navList = document.createElement("ul");
    navList.className = "flex space-x-4";

    const navItems = ["Setup", "Game", "Leaderboard", "Profile", "Simulation"];
    navItems.forEach((item) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${item.toLowerCase()}`;
        link.textContent = item;
        link.className = "hover:underline";
        li.appendChild(link);
        navList.appendChild(li);
    });

    const loginStatus = document.createElement("li");
    loginStatus.className = "ml-auto";
    loginStatus.innerHTML = '<a href="#login" class="hover:underline">Login</a>';
    navList.appendChild(loginStatus);

    nav.appendChild(navList);
    header.appendChild(title);
    header.appendChild(nav);

    await showUserStatus(loginStatus);

    return header;
};
