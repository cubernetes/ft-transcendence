import { checkAccess } from "../../auth/auth.utils";
import { createLoginForm } from "../../components/components.loginForm";
import { ASSETS_DIR } from "../../config";

export const createHomePage = async (): Promise<HTMLElement> => {
    const fragment = document.createDocumentFragment();

    const main = document.createElement("main");
    main.className = "w-full h-screen relative";

    // Background video
    const video = document.createElement("video");
    video.src = `${ASSETS_DIR}/videos/pong_simulation.webm`;
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

    // const heroTitle = document.createElement("h1");
    // heroTitle.className = "text-6xl font-bold mb-10 text-red-20 font-medieval";
    // heroTitle.textContent = "Transcend!";

    const ctaButton = document.createElement("a");
    ctaButton.className =
        "absolute cursor-pointer font-medieval top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 \
        text-white text-center rounded-full border-2 border-red-600 hover:border-red-400 transition-all \
        duration-300 ease-in-out transform hover:scale-105 w-[100px] h-[100px] leading-[100px]";
    ctaButton.textContent = "Play";
    ctaButton.onclick = async () => {
        mainMusic.play();
        if (checkAccess()) {
            window.location.href = "#setup";
        }
        const loginForm = await createLoginForm(ctaButton);
        ctaButton.replaceWith(loginForm);
    };

    const mainMusic = new Audio(`${ASSETS_DIR}/audio/main.mp3`);
    mainMusic.loop = true;
    mainMusic.volume = 0.4;

    // hero.appendChild(heroTitle);
    hero.appendChild(ctaButton);
    main.appendChild(video);
    main.appendChild(overlay);
    main.appendChild(hero);

    fragment.appendChild(main);

    const container = document.createElement("div");
    container.appendChild(fragment);

    return container;
};
