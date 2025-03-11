export function createGameSection(): HTMLElement {
    const section = document.createElement("section");
    section.className = "p-4";

    const title = document.createElement("h2");
    title.className = "text-2xl font-bold mb-4";
    title.textContent = "Pong Game";

    const gameContainer = document.createElement("div");
    gameContainer.className = "bg-black h-80 rounded-lg flex items-center justify-center relative";
    gameContainer.id = "game-container";

    section.appendChild(title);
    section.appendChild(gameContainer);

    return section;
}
