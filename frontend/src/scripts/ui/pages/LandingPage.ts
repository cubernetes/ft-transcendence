import { createPongEngine } from "@darrenkuro/pong-core";
import { navigateTo } from "../../global/router";
import { authStore, initAuthState } from "../../modules/auth/auth.store";
import { createGameController } from "../../modules/game/game.controller";
import { createRenderer } from "../../modules/game/game.renderer";
import { gameStore } from "../../modules/game/game.store";
import { layoutStore } from "../../modules/layout/layout.store";
import { createEl, replaceChildren } from "../../utils/dom-helper";
import { createButton } from "../components/Button";
import { createContainer } from "../components/Container";
import { createLoginForm } from "../layout/LoginForm";

export const createLandingPage: PageRenderer = async (): Promise<HTMLElement[]> => {
    // Create music and video element
    const musicEl = createEl("audio", "", {
        attributes: { src: `${CONST.DIR.AUDIO}/main.mp3` },
        props: { loop: true, volume: 0.4 },
    });
    const videoEl = createEl("video", "w-full h-full object-cover", {
        attributes: { src: `${CONST.DIR.VIDEO}/pong_simulation.webm` },
        props: { autoplay: true, loop: true, muted: true },
    });

    // Create an overlay element
    const overlayEl = createEl(
        "div",
        "absolute top-0 left-0 w-full h-full bg-black opacity-40 pointer-events-none"
    );

    // Create a call-to-action button
    const ctaButtonEl = createButton({
        text: CONST.TEXT.PLAY,
        tw: [
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "rounded-full text-white p-0 border-2 border-red-600 hover:border-red-400",
            "transition-all duration-300 ease-in-out",
            "hover:scale-105 w-[100px] h-[100px] leading-[100px]",
        ].join(" "),
        click: () => {
            const { canvas } = layoutStore.get();

            // Initilize game components here so browser doesn't warn need user gesture
            // TODO: This is a problem, if flashes still
            createRenderer(canvas).then((renderer) => {
                const engine = createPongEngine();
                const controller = createGameController(renderer, engine);

                gameStore.update({ controller });
            });

            initAuthState().then(async (state) => {
                authStore.set(state);
                if (state.isAuthenticated) return navigateTo(CONST.ROUTE.HOME);

                const loginFormEl = await createLoginForm(ctaButtonEl);
                replaceChildren(heroCtn, loginFormEl);
            });

            musicEl.play();
        },
    });

    // Create hero container
    const heroCtn = createContainer({
        tw: "absolute top-0 left-0 w-full h-full",
        children: [ctaButtonEl],
    });

    const mainCtn = createContainer({
        tag: "main",
        tw: "w-full h-screen relative",
        children: [videoEl, overlayEl, heroCtn],
    });

    return [mainCtn];
};
