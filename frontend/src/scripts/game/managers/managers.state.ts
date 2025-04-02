import {
    Ball,
    Paddle,
    PongConfig,
    PongState,
    PongStatus,
    Position3D,
    Size3D,
    Vector3D,
} from "@darrenkuro/pong-core";
import { GameInstance } from "../game.instance";
import { IServerGameState } from "../game.types";

export class GameStateManager {
    private state = {
        status: "waiting",
        scores: [0, 0],
        ball: {
            pos: { x: 0, y: 0, z: 0 },
            vec: { x: 0, y: 0, z: 0 },
            r: 0.3,
            speed: 0.2,
        } as Ball,
        paddles: [
            {
                pos: { x: -10, y: 0.5, z: 0 },
                size: { width: 0.2, height: 0.3, depth: 5 } as Size3D,
                speed: 0.3,
            } as Paddle,
            {
                pos: { x: 10, y: 0.5, z: 0 },
                size: { width: 0.2, height: 0.3, depth: 5 } as Size3D,
                speed: 0.3,
            } as Paddle,
        ],
    } as PongState;

    async startGame(payload: { gameId: string; opponentId: string; index: number }) {
        this.state.status = "ongoing";
        // const instance = await GameInstance.getInstance(
        //     document.getElementById("renderCanvas") as HTMLCanvasElement
        // );
        // instance.startGame(payload);
    }

    async endGame(winner: string) {
        this.state.status = "ended";
        // const instance = await GameInstance.getInstance(
        //     document.getElementById("renderCanvas") as HTMLCanvasElement
        // );
        // instance.endGame(winner);
    }

    async updateScore(score: [number, number]) {
        this.state.scores = score;
        const instance = await GameInstance.getInstance(
            document.getElementById("renderCanvas") as HTMLCanvasElement
        );
        instance.updateScore(score);
    }

    async handleWallCollision() {
        const instance = await GameInstance.getInstance(
            document.getElementById("renderCanvas") as HTMLCanvasElement
        );
        instance.handleWallCollision();
    }

    async handlePaddleCollision() {
        const instance = await GameInstance.getInstance(
            document.getElementById("renderCanvas") as HTMLCanvasElement
        );
        instance.handlePaddleCollision();
    }

    async updateGameObjects(payload: PongState) {
        const instance = await GameInstance.getInstance(
            document.getElementById("renderCanvas") as HTMLCanvasElement
        );
        if (!payload) return;

        instance.updateBallPosition(payload.ball.pos.x, payload.ball.pos.y, payload.ball.pos.z);

        instance.updateLeftPaddlePosition(
            payload.paddles[0].pos.x,
            payload.paddles[0].pos.y,
            payload.paddles[0].pos.z
        );

        instance.updateRightPaddlePosition(
            payload.paddles[1].pos.x,
            payload.paddles[1].pos.y,
            payload.paddles[1].pos.z
        );

        instance.updateScore(payload.scores);
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
