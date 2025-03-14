import { createHeader } from "../components/Header";
import { createFooter } from "../components/Footer";
import { create3DGameSection } from "../components/GameSection3D";
import { createGameSection } from "../components/GameSection";

export const createGamePage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4";

    const game3DSection = await create3DGameSection();
    main.appendChild(game3DSection);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    container.addEventListener('destroy', () => {
        game3DSection.dispatchEvent(new Event("destroy"));
    });

    return container;
};
