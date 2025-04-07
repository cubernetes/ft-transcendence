import { checkAccess } from "../../auth/auth.utils";
import { ASSETS_DIR } from "../../config";
import { createEl } from "../../utils/dom.helper";
import { logger } from "../../utils/logger";
import { createLoginForm } from "./landing.loginForm";

export const createLandingPage = async (): Promise<HTMLElement[]> => {
    // Background video
    const videoEl = createEl("video", "w-full h-full object-cover", {
        attributes: {
            src: `${ASSETS_DIR}/videos/pong_simulation.webm`,
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
            events: {
                click: async () => {
                    musicEl.play(); // FIX, always playing new stuff
                    if (checkAccess()) {
                        window.location.href = "#setup";
                    }
                    const loginForm = await createLoginForm(ctaButton);
                    ctaButton.replaceWith(loginForm);
                },
            },
        }
    );

    const heroEl = createEl(
        "div",
        "absolute top-0 left-0 w-full h-full flex flex-col p-8 rounded-lg text-center",
        { children: [ctaButton] }
    );

    const musicEl = createEl("audio", "", {
        attributes: { src: `${ASSETS_DIR}/audio/main.mp3` },
        props: { loop: true, volume: 0.4 },
    });

    const mainEl = createEl("main", "w-full h-screen relative", {
        children: [videoEl, overlayEl, heroEl],
    });

    return [mainEl];
};
