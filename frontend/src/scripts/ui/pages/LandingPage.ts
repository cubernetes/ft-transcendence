import { createPongEngine } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { authStore, initAuthState } from "../../modules/auth/auth.store";
import { createGameController } from "../../modules/game/game.controller";
import { createRenderer } from "../../modules/game/game.renderer";
import { gameStore } from "../../modules/game/game.store";
import { layoutStore } from "../../modules/layout/layout.store";
import { createEl } from "../../utils/dom-helper";
import { createLoginForm } from "../layout/LoginForm";

export const createLandingPage: PageRenderer = async (): Promise<HTMLElement[]> => {
    // Background video
    const videoEl = createEl("video", "w-full h-full object-cover", {
        attributes: {
            src: `${CONST.DIR.VIDEO}/pong_simulation.webm`,
        },
        props: { autoplay: true, loop: true, muted: true },
    });

    const overlayEl = createEl("div", "absolute top-0 left-0 w-full h-full bg-black opacity-40");

    const ctaButton = createEl(
        "a",
        [
            "absolute cursor-pointer top-1/2 left-1/2",
            "transform -translate-x-1/2 -translate-y-1/2 text-white text-center",
            "rounded-full border-2 border-red-600 hover:border-red-400",
            "transition-all duration-300 ease-in-out transform",
            "hover:scale-105 w-[100px] h-[100px] leading-[100px]",
        ].join(" "),
        {
            text: "Play",
        }
    );

    ctaButton.onclick = () => {
        musicEl.play();

        const { canvas } = layoutStore.get();

        // Initilize game components here so babylon audio engine doesn't show unmute button
        // Should move later
        createRenderer(canvas).then((renderer) => {
            const engine = createPongEngine();
            const controller = createGameController(renderer, engine);

            gameStore.update({ controller });
        });

        initAuthState().then(async (state) => {
            authStore.set(state);
            if (state.isAuthenticated) return navigateTo(CONST.ROUTE.HOME);

            const loginForm = await createLoginForm(ctaButton);
            ctaButton.replaceWith(loginForm);
        });
    };

    const heroEl = createEl(
        "div",
        "absolute top-0 left-0 w-full h-full flex flex-col p-8 rounded-lg text-center",
        { children: [ctaButton] }
    );

    const musicEl = createEl("audio", "", {
        attributes: { src: `${CONST.DIR.AUDIO}/main.mp3` },
        props: { loop: true, volume: 0.4 },
    });

    const mainEl = createEl("main", "w-full h-screen relative", {
        children: [videoEl, overlayEl, heroEl],
    });

    return [mainEl];
};
