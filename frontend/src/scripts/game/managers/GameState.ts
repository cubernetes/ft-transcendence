import { IBabylonGameState, IServerGameState, ICollisionEvent } from "../game.types";
import { AudioManager } from "./Audio";
import { gameConfig } from "../GameConfig";
import { CreateText, Mesh, Scene, Vector3 } from "@babylonjs/core";
import { ASSETS_DIR } from "../../config";

export class GameStateManager {
    private state: IBabylonGameState = {
        score: { player1: 0, player2: 0 },
        fontData: null,
        gameRunning: false,
        lastCollisionEvents: [],
    };

    constructor(private audioManager: AudioManager) {}

    updateGameObjects(eventData: string, scene: Scene) {
        const gameState = JSON.parse(eventData);
        if (!gameState && !this.state.gameRunning) return;

        this.updateBallPosition(gameState);
        this.updatePaddlePosition(gameState);
        this.updateScore(gameState, scene);
        this.handleCollisionEvents(gameState);
    }

    private updateBallPosition(gameState: IServerGameState) {
        if (gameState.ballPosition && this.state.ball) {
            this.state.ball.position.x = gameState.ballPosition.x;
            this.state.ball.position.y = gameState.ballPosition.y;
            this.state.ball.position.z = gameState.ballPosition.z;
        }
    }

    private updatePaddlePosition(gameState: IServerGameState) {
        if (gameState.paddlePosition) {
            if (this.state.paddle1) {
                this.state.paddle1.position.x = gameState.paddlePosition["player-1"].x;
                this.state.paddle1.position.y = gameState.paddlePosition["player-1"].y;
                this.state.paddle1.position.z = gameState.paddlePosition["player-1"].z;
            }
            if (this.state.paddle2) {
                this.state.paddle2.position.x = gameState.paddlePosition["player-2"].x;
                this.state.paddle2.position.y = gameState.paddlePosition["player-2"].y;
                this.state.paddle2.position.z = gameState.paddlePosition["player-2"].z;
            }
        }
    }

    async updateScore(gameState: IServerGameState, scene: Scene) {
        // Check if the score has changed
        if (
            !gameState.score ||
            (gameState.score.player1 === this.state.score.player1 &&
                gameState.score.player2 === this.state.score.player2)
        ) {
            return;
        }

        this.state.score = gameState.score;

        if (!this.state.fontData)
            this.state.fontData = await (
                await fetch(`${ASSETS_DIR}/Montserrat_Regular.json`)
            ).json();
        if (this.state.scoreText) this.state.scoreText.dispose();

        // Create initial score text
        const text = CreateText(
            "scoreText",
            `Score: ${this.state.score.player1} - ${this.state.score.player2}`,
            this.state.fontData,
            {
                size: 0.5, // text size
                depth: 0.1, // extrusion depth
                resolution: 32, // curve resolution
            }
        );
        //TODO: handle error checks after creating babylon objects.

        if (!text) throw new Error("Failed to create score text");
        this.state.scoreText = text;
        this.state.scoreText.position = gameConfig.positions.SCORE;
        this.state.scoreText.rotation.x = gameConfig.rotations.SCORE;
    }

    handleCollisionEvents(gameState: IServerGameState) {
        if (!gameState.collisionEvents || gameState.collisionEvents.length === 0) return;
        // Get only new events by comparing timestamps
        const newEvents = gameState.collisionEvents.filter(
            (event: any) =>
                !this.state.lastCollisionEvents.some((e: any) => e.timestamp === event.timestamp)
        );

        if (newEvents.length > 0) {
            console.log("New collision events:", newEvents);

            // Play sounds for each new event
            newEvents.forEach((event: any) => {
                if (event.type === "paddle") {
                    this.audioManager.playSound("bounce");
                } else if (event.type === "wall") {
                    this.audioManager.playSound("bounce");
                } else if (event.type === "score") {
                    this.audioManager.playSound("hit");
                }
            });

            // Update last collision events
            this.state.lastCollisionEvents = gameState.collisionEvents;
        }
    }

    setBall(ball: Mesh) {
        this.state.ball = ball;
    }

    setPaddles(paddle1: Mesh, paddle2: Mesh) {
        this.state.paddle1 = paddle1;
        this.state.paddle2 = paddle2;
    }

    setGameRunning(gameRunning: boolean) {
        this.state.gameRunning = gameRunning;
    }
}
