import { GameInstance } from "../game.instance";
import { IServerGameState } from "../game.types";

export class GameStateManager {
    private state = {
        score: { player1: 0, player2: 0 },
        lastCollisionEvents: [],
    };

    async updateGameObjects(eventData: string) {
        const gameState: IServerGameState = JSON.parse(eventData);
        const instance = await GameInstance.getInstance(
            document.getElementById("renderCanvas") as HTMLCanvasElement
        );
        if (!gameState) return;

        const ballPosition = gameState.ballPosition;
        instance.updateBallPosition(ballPosition.x, ballPosition.y, ballPosition.z);

        const leftPaddlePosition = gameState.paddlePosition["player-1"];
        const rightPaddlePosition = gameState.paddlePosition["player-2"];
        instance.updateLeftPaddlePosition(
            leftPaddlePosition.x,
            leftPaddlePosition.y,
            leftPaddlePosition.z
        );
        instance.updateRightPaddlePosition(
            rightPaddlePosition.x,
            rightPaddlePosition.y,
            rightPaddlePosition.z
        );

        // this.updateScore(gameState, scene);
        if (gameState.score) {
            instance.updateScore(gameState.score);
        }

        if (gameState.collisionEvents && gameState.collisionEvents.length) {
            instance.handleCollisionEvents(gameState.collisionEvents);
        }
    }

    // async updateScore(gameState: IServerGameState, scene: Scene) {
    //     // Check if the score has changed
    //     if (
    //         !gameState.score ||
    //         (gameState.score.player1 === this.state.score.player1 &&
    //             gameState.score.player2 === this.state.score.player2)
    //     ) {
    //         return;
    //     }
    //     this.state.score = gameState.score;
    //     // Create initial score text
    //     const text = CreateText(
    //         "scoreText",
    //         `Score: ${this.state.score.player1} - ${this.state.score.player2}`,
    //         this.state.fontData,
    //         {
    //             size: 0.5, // text size
    //             depth: 0.1, // extrusion depth
    //             resolution: 32, // curve resolution
    //         }
    //     );
    //     //TODO: handle error checks after creating babylon objects.

    //     if (!text) throw new Error("Failed to create score text");
    //     this.state.scoreText = text;
    //     this.state.scoreText.position = gameConfig.positions.SCORE;
    //     this.state.scoreText.rotation.x = gameConfig.rotations.SCORE;
    // }
}
