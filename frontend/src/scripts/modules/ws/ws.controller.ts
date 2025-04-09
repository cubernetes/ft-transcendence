import { gameStore } from "../game/game.store";

export const createWsController = (conn: WebSocket) => {
    conn.onopen = () => {
        window.log.info("WebSocket connection established");
    };

    conn.onerror = (error) => {
        if (error instanceof ErrorEvent) {
            window.log.debug(`Websocket error: ${error.message}`);
        } else {
            window.log.debug(`Websocket unknown error`);
        }
    };

    conn.onclose = () => {
        window.log.info("WebSocket connection closed");
    };

    conn.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data); // Parse incoming message

            if (!message.type) {
                window.log.warn("Received WebSocket message without a type:", message);
                return;
            }

            if (message.type === "game-start") {
                const { gameId, opponentId, index } = message.payload;
                gameStore.update({
                    isPlaying: true,
                    isWaiting: false,
                    mode: "remote",
                    gameId,
                    opponentId,
                    index,
                });
                return;
            }

            const gameEvents = [
                "game-end",
                "wall-collision",
                "paddle-collision",
                "state-update",
                "ball-reset",
                "score",
            ];
            // window.log.debug("Received WebSocket message:", message);

            const gameState = gameStore.get();

            if (
                gameEvents.includes(message.type) &&
                (!gameState.isPlaying || gameState.mode !== "remote")
            ) {
                window.log.error("Socket game event failed");
                return;
            }

            switch (message.type) {
                case "game-end":
                    gameState.controller?.handleEndGame("fakeWinnerName");
                    break;

                case "score":
                    gameState.controller?.updateScores(message.payload.scores);
                    break;

                case "wall-collision":
                    gameState.controller?.handleWallCollision();
                    break;

                case "paddle-collision":
                    gameState.controller?.handlePaddleCollision();
                    break;

                case "state-update":
                    gameState.controller?.updateState(message.payload);
                    break;

                default:
                    window.log.warn("Unknown WebSocket event type:", message.type);
            }
        } catch (error) {
            window.log.error("Error parsing WebSocket message:", error, event.data);
        }
    };
};
