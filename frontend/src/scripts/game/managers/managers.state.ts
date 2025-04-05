import { Ball, Paddle, PongState, Size3D } from "@darrenkuro/pong-core";
import { GameInstance } from "../game.instance";

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
    private gameId = "";
    private index = 0;
    private opponentId = "";

    getGameId() {
        return this.gameId;
    }

    getOpponentId() {
        return this.opponentId;
    }

    getPlayerIndex() {
        return this.index;
    }

    getState() {
        return this.state;
    }

    async startGame(payload: { gameId: string; opponentId: string; index: number }) {
        this.state.status = "ongoing";
        this.gameId = payload.gameId;
        this.index = payload.index;
        this.opponentId = payload.opponentId;
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
        if (score[0] !== this.state.scores[0] || score[1] !== this.state.scores[1]) {
            this.state.scores = score;
            const instance = await GameInstance.getInstance(
                document.getElementById("renderCanvas") as HTMLCanvasElement
            );
            instance.updateScore(score);
        }
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

    async resetBall() {
        const instance = await GameInstance.getInstance(
            document.getElementById("renderCanvas") as HTMLCanvasElement
        );
        this.state.ball.pos = { x: 0, y: 0, z: 0 };
        this.state.ball.vec = { x: 0, y: 0, z: 0 };
        instance.updateBallPosition(0, 0, 0);
        instance.handleBallReset();
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

        if (
            payload.scores[0] !== this.state.scores[0] ||
            payload.scores[1] !== this.state.scores[1]
        ) {
            this.state.scores = payload.scores;
            instance.updateScore(payload.scores);
        }
    }
}
