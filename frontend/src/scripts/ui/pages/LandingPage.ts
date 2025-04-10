import { authStore } from "../../modules/auth/auth.store";
import { hidePageElements } from "../../modules/layout/layout.utils";
import { createEl } from "../../utils/dom-helper";
import { createLoginForm } from "../layout/LoginForm";

export const createLandingPage: PageRenderer = async (): Promise<HTMLElement[]> => {
    hidePageElements();

    // Background video
    const videoEl = createEl("video", "w-full h-full object-cover", {
        attributes: {
            src: `${window.cfg.dir.video}/pong_simulation.webm`,
        },
        props: { autoplay: true, loop: true, muted: true },
    });

    const overlayEl = createEl("div", "absolute top-0 left-0 w-full h-full bg-black opacity-40");

    const ctaButton = createEl(
        "a",
        [
            "absolute cursor-pointer font-medieval top-1/2 left-1/2",
            "transform -translate-x-1/2 -translate-y-1/2 text-white text-center",
            "rounded-full border-2 border-red-600 hover:border-red-400",
            "transition-all duration-300 ease-in-out transform",
            "hover:scale-105 w-[100px] h-[100px] leading-[100px]",
        ].join(" "),
        {
            text: "Play",
        }
    );

    ctaButton.onclick = async () => {
        musicEl.play(); // FIX, always playing new stuff?

        const authState = authStore.get();
        if (authState.isAuthenticated) {
            window.location.href = window.cfg.url.home;
        }

        // If no token in store, check for a JWT in localStorage
        const jwtToken = localStorage.getItem(window.cfg.label.token);
        // TODO: ping the backend to verify token found in localStorge
        // but maybe rewrite this logic for satefy so ignored for now

        const loginForm = await createLoginForm(ctaButton);
        ctaButton.replaceWith(loginForm);
    };

    const heroEl = createEl(
        "div",
        "absolute top-0 left-0 w-full h-full flex flex-col p-8 rounded-lg text-center",
        { children: [ctaButton] }
    );

    const musicEl = createEl("audio", "", {
        attributes: { src: `${window.cfg.dir.audio}/main.mp3` },
        props: { loop: true, volume: 0.4 },
    });

    // Dispose audio once leaving the page?
    // musicEl.addEventListener("destory", () => {
    //     musicEl.pause();
    //     musicEl.src = "";
    //     musicEl.removeAttribute("src");
    //     musicEl.load();
    // });

    const mainEl = createEl("main", "w-full h-screen relative", {
        children: [videoEl, overlayEl, heroEl],
    });

    return [mainEl];
};
