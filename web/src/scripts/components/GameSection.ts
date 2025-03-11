export function createGameSection(): HTMLElement {
    const section = document.createElement("section");
    section.className = "p-4";

    const title = document.createElement("h2");
    title.className = "text-2xl font-bold mb-4";
    title.textContent = "Pong Game";

    const gameContainer = document.createElement("div");
    gameContainer.className = "bg-black h-80 rounded-lg flex items-center justify-center relative";
    gameContainer.id = "game-container";

    // Create a ball element for the Pong game
    const ball = document.createElement("div");
    ball.className = "absolute bg-white rounded-full";
    ball.style.width = "20px";
    ball.style.height = "20px";
    ball.style.top = "50%"; // Center the ball vertically
    ball.style.left = "50%"; // Center the ball horizontally
    gameContainer.appendChild(ball);

    // Create paddles
    const playerPaddle = document.createElement("div");
    playerPaddle.className = "absolute bg-white";
    playerPaddle.style.width = "10px";
    playerPaddle.style.height = "80px";
    playerPaddle.style.left = "10px"; // Example left position for player paddle
    gameContainer.appendChild(playerPaddle);

    const opponentPaddle = document.createElement("div");
    opponentPaddle.className = "absolute bg-white";
    opponentPaddle.style.width = "10px";
    opponentPaddle.style.height = "80px";
    opponentPaddle.style.right = "10px"; // Example right position for opponent paddle
    gameContainer.appendChild(opponentPaddle);

    // WebSocket setup
    const socket = new WebSocket("/ws");

    socket.onopen = () => {
        console.log("WebSocket connection established.");
        // socket.send("ping"); // Send a test message
        socket.send("join player-1"); // Join the game as player 1);
    };

    socket.onmessage = (event) => {
        console.log("Message from server:", event.data);

        const gameState = JSON.parse(event.data);

        if (gameState) {
            console.log("Updated game state received:", gameState);
            // Update ball position
            if (gameState.ballPosition) {
                ball.style.top = `${gameState.ballPosition.y}px`;
                ball.style.left = `${gameState.ballPosition.x}px`;
            }

            // Update player paddle position
            if (gameState.paddlePosition) {
                const player1PaddlePos = gameState.paddlePosition["player-1"].y;
                playerPaddle.style.top = `${player1PaddlePos}px`; // Move player paddle

                const opponentPaddlePos = gameState.paddlePosition["player-2"].y;
                opponentPaddle.style.top = `${opponentPaddlePos}px`; // Move opponent paddle
            }

            // Update the score
            if (gameState.score) {
                console.log(
                    `Score: Player 1 - ${gameState.score.player1}, Player 2 - ${gameState.score.player2}`
                );
            }
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed.");
    };

    let lastDirection: "up" | "down" | "stop" = "stop";

    function sendDirection(direction: "up" | "down" | "stop") {
        if (direction !== lastDirection && socket.readyState === WebSocket.OPEN) {
            socket.send(`move ${direction}`);
            lastDirection = direction;
        }
    }

    // Add event listeners for keyboard input (arrow keys)
    document.addEventListener("keydown", (event) => {
        console.log(`Key pressed: ${event.key}`);
        if (event.key === "ArrowUp") {
            sendDirection("up");
        } else if (event.key === "ArrowDown") {
            sendDirection("down");
        }
    });

    document.addEventListener("keyup", (event) => {
        console.log(`Key released: ${event.key}`);
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            sendDirection("stop");
        }
    });

    // Button to send a test message
    const startButton = document.createElement("button");
    startButton.className = "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600";
    startButton.textContent = "Start Game";
    startButton.addEventListener("click", () => {
        console.log("Start game clicked");

        // Prevent layout shift by updating existing elements
        const startMessage = document.createElement("p");
        startMessage.className = "text-white";
        startMessage.textContent = "Game started! Use arrow keys to move your paddle.";

        // Remove any existing messages or buttons
        const existingStartButton = gameContainer.querySelector("button");
        if (existingStartButton) existingStartButton.remove();

        gameContainer.appendChild(startMessage);

        if (socket.readyState === WebSocket.OPEN) {
            console.log("Sending startPong");
            socket.send("startPong"); // Start the game
        } else {
            console.error("WebSocket is not open.");
        }
    });

    gameContainer.appendChild(startButton);
    section.appendChild(title);
    section.appendChild(gameContainer);

    return section;
}
