import { createHeader } from "../components/Header";
import { createFooter } from "../components/Footer";

export async function createHomePage(): Promise<HTMLElement> {
    const fragment = document.createDocumentFragment();

    const header = createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4";

    const hero = document.createElement("div");
    hero.className = "bg-blue-100 p-8 rounded-lg text-center mb-8";

    const heroTitle = document.createElement("h1");
    heroTitle.className = "text-4xl font-bold mb-4";
    heroTitle.textContent = "Welcome to ft-transcendence";

    const heroText = document.createElement("p");
    heroText.className = "text-xl";
    heroText.textContent = "The ultimate pong experience";

    const ctaButton = document.createElement("a");
    ctaButton.href = "#game";
    ctaButton.className =
        "inline-block mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600";
    ctaButton.textContent = "Play Now";

    hero.appendChild(heroTitle);
    hero.appendChild(heroText);
    hero.appendChild(ctaButton);
    main.appendChild(hero);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
}
