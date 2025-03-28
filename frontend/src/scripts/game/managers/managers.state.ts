import { IBabylonGameState, IServerGameState, ICollisionEvent } from "../game.types";
// import { AudioManager } from "./managers.audio";
import { IServerGameState } from "../game.types";
import { GameInstance } from "../game.instance";

export class GameStateManager {
    private state = {
        score: { player1: 0, player2: 0 },
        lastCollisionEvents: [],
    };

    updateGameObjects(eventData: string) {
        const gameState: IServerGameState = JSON.parse(eventData);
        const gameInstance = GameInstance.getInstance(
            document.getElementById("renderCanvas") as HTMLCanvasElement
        );

        if (!gameState) return;

        this.updateBallPosition(gameState, gameInstance);
        this.updatePaddlePosition(gameState, gameInstance);
    }

    private updateBallPosition(gameState: IServerGameState, gameInstance: GameInstance) {
        if (gameState.ballPosition && gameInstance.ball) {
            gameInstance.ball.position.set(
                gameState.ballPosition.x,
                gameState.ballPosition.y,
                gameState.ballPosition.z
            );
        }
    }

    private updatePaddlePosition(gameState: IServerGameState, gameInstance: GameInstance) {
        if (gameState.paddlePosition) {
            if (gameInstance.paddle1) {
                gameInstance.paddle1.position.set(
                    gameState.paddlePosition["player-1"].x,
                    gameState.paddlePosition["player-1"].y,
                    gameState.paddlePosition["player-1"].z
                );
            }
            if (gameInstance.paddle2) {
                gameInstance.paddle2.position.set(
                    gameState.paddlePosition["player-2"].x,
                    gameState.paddlePosition["player-2"].y,
                    gameState.paddlePosition["player-2"].z
                );
            }
        }
    }
}
