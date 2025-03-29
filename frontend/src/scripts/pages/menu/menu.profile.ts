import { createHeader } from "../../components/components.header";
import { createFooter } from "../../components/components.footer";

export const createProfilePage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const header = await createHeader();

    const main = document.createElement("main");
    main.className = "container mx-auto p-4";

    const profileSection = document.createElement("section");
    profileSection.className = "bg-white p-6 rounded-lg shadow-md";

    const profileTitle = document.createElement("h2");
    profileTitle.className = "text-2xl font-bold mb-4";
    profileTitle.textContent = "Your Profile";

    const profileInfo = document.createElement("div");
    profileInfo.className = "space-y-4";

    const username = document.createElement("p");
    username.innerHTML = '<span class="font-semibold">Username:</span> Player1';

    const stats = document.createElement("p");
    stats.innerHTML = '<span class="font-semibold">Games Played:</span> 0';

    profileInfo.appendChild(username);
    profileInfo.appendChild(stats);
    profileSection.appendChild(profileTitle);
    profileSection.appendChild(profileInfo);

    main.appendChild(profileSection);

    const footer = createFooter();

    fragment.appendChild(header);
    fragment.appendChild(main);
    fragment.appendChild(footer);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
};
