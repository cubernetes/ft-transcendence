export const createPaddles = (mainContainer: HTMLElement): HTMLElement => {
    // Container for paddles
    const paddleContainer = document.createElement("div");
    paddleContainer.className = "absolute top-0 left-0 w-full h-full pointer-events-none";

    // Left paddle
    const paddle1 = document.createElement("div");
    paddle1.className =
        "absolute bg-black w-8 h-96 left-10 top-1/2 transform -translate-y-1/2 transition-all duration-50 ease-linear z-10";

    // Right paddle
    const paddle2 = document.createElement("div");
    paddle2.className =
        "absolute bg-black w-8 h-96 right-10 top-1/2 transform -translate-y-1/2 transition-all duration-50 ease-linear z-10";

    paddleContainer.appendChild(paddle1);
    paddleContainer.appendChild(paddle2);

    document.addEventListener("mousemove", (event) => {
        const containerRect = mainContainer.getBoundingClientRect();
        const cursorY = event.clientY;
        const cursorX = event.clientX;

        // Limit movement within the container
        const minY = containerRect.top + 220;
        const maxY = containerRect.bottom - 220;

        // Clamp cursor position
        const newY = Math.min(Math.max(cursorY, minY), maxY);

        if (cursorX < containerRect.width / 2) {
            paddle1.style.top = `${newY}px`;
        } else if (cursorX > containerRect.width / 2) {
            paddle2.style.top = `${newY}px`;
        }
    });

    return paddleContainer;
};
