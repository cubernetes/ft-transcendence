import { IBabylonGameState, IServerGameState, ICollisionEvent } from "../game.types";
// import { AudioManager } from "./managers.audio";
import { IServerGameState } from "../game.types";
import { GameInstance } from "../game.instance";

export class GameStateManager {
    private state = {
        score: { player1: 0, player2: 0 },
        lastCollisionEvents: [],
    };

    async updateGameObjects(eventData: string) {
        const gameState: IServerGameState = JSON.parse(eventData);
        const gameInstance = await GameInstance.getInstance(
            document.getElementById("renderCanvas") as HTMLCanvasElement
        );

        if (!gameState) return;

        this.updateBallPosition(gameState, gameInstance);
        this.updatePaddlePosition(gameState, gameInstance);

        // this.updateScore(gameState, scene);
        // this.handleCollisionEvents(gameState);
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

    //     if (!this.state.fontData)
    //         this.state.fontData = await (
    //             await fetch(`${ASSETS_DIR}/Montserrat_Regular.json`)
    //         ).json();
    //     if (this.state.scoreText) this.state.scoreText.dispose();

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

    // handleCollisionEvents(gameState: IServerGameState) {
    //     if (!gameState.collisionEvents || gameState.collisionEvents.length === 0) return;
    //     // Get only new events by comparing timestamps
    //     const newEvents = gameState.collisionEvents.filter(
    //         (event: any) =>
    //             !this.state.lastCollisionEvents.some((e: any) => e.timestamp === event.timestamp)
    //     );

    //     if (newEvents.length > 0) {
    //         console.log("New collision events:", newEvents);

    //         // Play sounds for each new event
    //         newEvents.forEach((event: any) => {
    //             // if (event.type === "paddle") {
    //             //     this.audioManager.playSound("bounce");
    //             // } else if (event.type === "wall") {
    //             //     this.audioManager.playSound("bounce");
    //             // } else if (event.type === "score") {
    //             //     this.audioManager.playSound("hit");
    //             // }
    //         });

    //         // Update last collision events
    //         this.state.lastCollisionEvents = gameState.collisionEvents;
    //     }
    // }
}
