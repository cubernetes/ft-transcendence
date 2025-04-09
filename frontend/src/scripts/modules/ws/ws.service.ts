import { UserInput } from "@darrenkuro/pong-core";
import { authStore } from "../auth/auth.store";
import { gameStore } from "../game/game.store";
import { createWsController } from "./ws.controller";

// All socket will go through this service, so this will be the only reference
let conn: WebSocket | null = null;

// Whenever user is authenticated, open a socket
authStore.subscribe((state) => {
    if (state.isAuthenticated) {
        conn = new WebSocket("ws");
        createWsController(conn);
    } else if (conn) {
        conn.close();
    }
});

export const sendGameStart = () => {
    if (!conn) {
        window.log.error("No socket connection");
        return;
    }

    if (conn.readyState === WebSocket.OPEN) {
        window.log.debug("Sending game-start");
        const token = authStore.get().token;
        const message = JSON.stringify({
            type: "game-start",
            payload: { token },
        });
        conn.send(message);
        window.log.debug("Game start message sent:", message);
    } else {
        window.log.error("WebSocket is not open.");
    }
};

export const sendDirection = (direction: UserInput) => {
    if (!conn) {
        window.log.error("No socket connection");
        return;
    }
    if (conn.readyState === WebSocket.OPEN) {
        const gameState = gameStore.get();
        const { gameId, index } = gameState;

        window.log.debug(`Sending direction: ${direction}, gameId: ${gameId}, index: ${index}`);

        if (conn.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                type: "game-action",
                payload: {
                    gameId,
                    index,
                    action: direction,
                },
            });
            conn.send(message);
        }
    } else {
        window.log.error("WebSocket is not open.");
    }
};
