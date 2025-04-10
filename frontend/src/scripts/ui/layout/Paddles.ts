import { createEl } from "../../utils/dom-helper";

export const createPaddles = (mainContainer: HTMLElement): HTMLElement => {
    const paddleTailwind =
        "absolute bg-black w-8 h-96 top-1/2 transform -translate-y-1/2 transition-all duration-50 ease-linear z-10";
    const leftPaddle = createEl("div", [paddleTailwind, "left-10"].join(" "));
    const rightPaddle = createEl("div", [paddleTailwind, "right-10"].join(" "));

    const paddleContainer = createEl(
        "div",
        "absolute top-0 left-0 w-full h-full pointer-events-none",
        { children: [leftPaddle, rightPaddle] }
    );

    const handleMouseMove = (evt: MouseEvent) => {
        const containerRect = mainContainer.getBoundingClientRect();
        const cursorY = evt.clientY;
        const cursorX = evt.clientX;

        const minY = containerRect.top + 220;
        const maxY = containerRect.bottom - 220;
        const newY = Math.min(Math.max(cursorY, minY), maxY);

        if (cursorX < containerRect.width / 2) {
            leftPaddle.style.top = `${newY}px`;
        } else {
            rightPaddle.style.top = `${newY}px`;
        }
    };

    // window.log.debug("Registering paddle listener");
    document.addEventListener("mousemove", handleMouseMove);

    paddleContainer.addEventListener("destroy", () => {
        // window.log.debug("Destroying paddle listener");
        document.removeEventListener("mousemove", handleMouseMove);
    });

    return paddleContainer;
};
