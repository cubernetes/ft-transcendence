import { createHeader } from "../components/Header";
import { createFooter } from "../components/Footer";
import { createGameSection } from "../components/GameSection3D";

export const createGamePage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4";

    const gameSection = await createGameSection();
    main.appendChild(gameSection);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
};
