import { createFooter } from "../layout/Footer";
import { createHeader } from "../layout/Header";

// TODO: 2FA, upload profile picture; profile pic, basic info
export const createProfilePage: PageRenderer = async (): Promise<HTMLElement[]> => {
    const header = await createHeader();
    const footer = createFooter();

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

    return [header, main, footer];
};
