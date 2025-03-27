import { createHeader } from "../components/components.header";
import { createFooter } from "../components/components.footer";
import { showUserLogin, showUserStatus } from "../components/components.login";
import { createLoginForm } from "../components/components.loginForm";

export const createHomePage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const main = document.createElement("main");
    main.className = "w-full h-screen relative";

    //Background video
    const video = document.createElement("video");
    video.src = "/assets/videos/pong_simulation.webm";
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.className = "w-full h-full object-cover";

    //Overlay
    const overlay = document.createElement("div");
    overlay.className = "absolute top-0 left-0 w-full h-full bg-black opacity-40";

    //Hero section
    const hero = document.createElement("div");
    hero.className = "absolute top-0 left-0 w-full h-full flex flex-col p-8 rounded-lg text-center";

    const heroTitle = document.createElement("h1");
    heroTitle.className = "text-6xl font-bold mb-10 text-white font-creepster";
    heroTitle.textContent = "Transcend!";

    const ctaButton = document.createElement("a");
    ctaButton.className =
        "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center rounded-full border-2 border-blue-600 hover:border-blue-400 transition-all duration-300 ease-in-out transform hover:scale-105";
    ctaButton.textContent = "Play";
    ctaButton.style.width = "100px"; // Set a fixed width (same as height for circle)
    ctaButton.style.height = "100px"; // Set a fixed height (same as width for circle)
    ctaButton.style.lineHeight = "100px"; // Vertically center text inside the circle
    ctaButton.onclick = async () => {
        const loginForm = await createLoginForm();
        ctaButton.replaceWith(loginForm);
    };

    hero.appendChild(heroTitle);
    hero.appendChild(ctaButton);
    main.appendChild(video);
    main.appendChild(overlay);
    main.appendChild(hero);

    fragment.appendChild(main);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
};
