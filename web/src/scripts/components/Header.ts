export function createHeader(): HTMLElement {
    const header = document.createElement("header");
    header.className = "bg-blue-500 p-4 text-white";

    const title = document.createElement("h1");
    title.className = "text-2xl font-bold cursor-pointer";
    title.textContent = "ft-transcendence";
    title.addEventListener("click", () => (window.location.href = "#home"));

    const nav = document.createElement("nav");
    nav.className = "mt-2";

    const navItems = ["Home", "Game", "Leaderboard", "Profile"];
    const navList = document.createElement("ul");
    navList.className = "flex space-x-4";

    navItems.forEach((item) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${item.toLowerCase()}`;
        a.textContent = item;
        a.className = "hover:underline";
        li.appendChild(a);
        navList.appendChild(li);
    });

    nav.appendChild(navList);
    header.appendChild(title);
    header.appendChild(nav);

    return header;
}
