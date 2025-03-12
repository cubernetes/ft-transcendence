import {
    Scene,
    Engine,
    ArcRotateCamera,
    Vector3,
    MeshBuilder,
    CreateText,
    Mesh,
    StandardMaterial,
    Color3,
    Texture,
    Sound,
} from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import earcut from "earcut";
(window as any).earcut = earcut;

// Game constants
const PADDLE_WIDTH = 0.2;
const PADDLE_HEIGHT = 0.3;
const PADDLE_DEPTH = 5;
const PADDLE_SPEED = 0.3;
const BALL_RADIUS = 0.3;
const BOARD_WIDTH = 20;
const BOARD_HEIGHT = 0.1;
const BOARD_DEPTH = 15;
const BALL_SPEED = 0.2;
const SCORE_POSITION = new Vector3(0, 0, 8);

// Game state
let score = { player1: 0, player2: 0 };
let scoreText: Mesh;
let ball: Mesh;
let paddle1: Mesh;
let paddle2: Mesh;
// let ballDirection = new Vector3(BALL_SPEED, 0, BALL_SPEED);
// let keysPressed: { [key: string]: boolean } = {};
let fontData: any = null;
let socket: WebSocket;
let gameRunning = false;

export async function create3DGameSection(): Promise<HTMLElement> {
    const container = document.createElement("div");
    container.className = "w-full h-[600px] relative"; // Set explicit height

    const gameSection = document.createElement("canvas");
    gameSection.className = "w-full h-full";
    gameSection.id = "renderCanvas"; // Add an ID for easier reference

    // Add a play button
    const playButton = document.createElement("button");
    playButton.textContent = "Click to Start Game";
    playButton.className = "container mx-auto";

    container.appendChild(playButton);
    container.appendChild(gameSection);

    socket = new WebSocket("/ws");

    socket.onopen = () => {
        console.log("WebSocket connection established.");
        socket.send("join player-1"); // Join the game as player 1);
    };

    // Initialize game only after user interaction
    playButton.addEventListener("click", () => {
        playButton.remove();
        if (socket.readyState === WebSocket.OPEN) {
            console.log("Sending startPong");
            socket.send("startPong"); // Start the game
        } else {
            console.error("WebSocket is not open.");
        }
        gameRunning = true;
        initialiseGame(gameSection, container);
    });

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed.");
    };

    return container;
}

function initialiseGame(gameSection: HTMLCanvasElement, container: HTMLElement) {
    const engine = new Engine(gameSection);

    const createScene = async function () {
        const scene = new Scene(engine);

        // Set up the scene first
        setScene(scene);
        setCamera(scene);

        // Then create game objects
        createGameObjects(scene);

        // Add score and music
        await addScore(scene);
        await addMusic(scene);

        // Set up controls
        setupKeyboardControls(scene);

        // Set up WebSocket message handler AFTER everything is initialized
        socket.onmessage = (event) => {
            updateGameObjects(event.data, scene);
        };

        // Enable inspector for debugging
        Inspector.Show(scene, {});

        return scene;
    };

    createScene().then((scene) => {
        engine.runRenderLoop(() => {
            scene.render();
        });

        // Handle window resize
        window.addEventListener("resize", () => {
            engine.resize();
        });
    });
}

function setScene(scene: Scene) {
    // Create a skybox
    const skybox = MeshBuilder.CreateBox("skybox", { size: 1000 }, scene);
    const skyboxMaterial = new StandardMaterial("skyboxMaterial", scene);
    skyboxMaterial.backFaceCulling = false;

    skyboxMaterial.diffuseTexture = new Texture("assets/sky-clouds-background.jpg", scene);
    skyboxMaterial.diffuseColor = new Color3(1, 1, 1);

    // Make sure the skybox is rendered behind everything else
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;

    // Create default lighting
    scene.createDefaultLight();
}

function setCamera(scene: Scene) {
    const camera = new ArcRotateCamera(
        "pongCamera",
        -Math.PI / 2, // alpha - side view (fixed)
        0.1, // beta - slightly above (fixed)
        25, // radius - distance from center
        Vector3.Zero(), // target - looking at center
        scene
    );
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 30;

    // Disable keyboard controls
    camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");

    // Keep only mouse wheel zoom
    camera.inputs.clear();
    camera.inputs.addMouseWheel();
}

function createGameObjects(scene: Scene) {
    // Create game board
    const board = MeshBuilder.CreateBox(
        "board",
        {
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            depth: BOARD_DEPTH,
        },
        scene
    );
    board.position.y = -0.5;
    const boardMaterial = new StandardMaterial("board", scene);
    boardMaterial.diffuseColor = new Color3(0, 1, 0);
    boardMaterial.specularColor = new Color3(1, 0, 0);
    board.material = boardMaterial;

    const paddleMaterial = new StandardMaterial("paddle", scene);
    paddleMaterial.diffuseColor = new Color3(0, 0, 1);
    // Create paddles
    paddle1 = MeshBuilder.CreateBox(
        "paddle1",
        {
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            depth: PADDLE_DEPTH,
        },
        scene
    );
    paddle1.position = new Vector3(-BOARD_WIDTH / 2 + 0.5, 0.5, 0);
    paddle1.rotation.x = Math.PI;
    paddle1.material = paddleMaterial;

    paddle2 = MeshBuilder.CreateBox(
        "paddle2",
        {
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            depth: PADDLE_DEPTH,
        },
        scene
    );
    paddle2.position = new Vector3(BOARD_WIDTH / 2 - 0.5, 0.5, 0);
    paddle2.rotation.x = Math.PI;
    paddle2.material = paddleMaterial;

    // Create ball
    ball = MeshBuilder.CreateSphere(
        "ball",
        {
            diameter: BALL_RADIUS * 2,
        },
        scene
    );
    ball.position = new Vector3(0, 0, 0);
    const ballMaterial = new StandardMaterial("ball", scene);
    ballMaterial.diffuseColor = new Color3(1, 0, 0);
    ball.material = ballMaterial;
}

async function addMusic(scene: Scene) {
    // Background music
    const backgroundMusic = new Sound("backgroundMusic", "assets/neon-gaming.mp3", scene, null, {
        loop: true,
        autoplay: true,
        volume: 1.0,
    });
    // Add hit sound for collisions
    const hitSound = new Sound("hit", "assets/hit.mp3", scene, null, {
        loop: false,
        autoplay: false,
    });
    const bounceSound = new Sound("bounce", "assets/bounce.mp3", scene, null, {
        loop: false,
        autoplay: false,
    });
    // Store sounds on scene for later use
    scene.metadata = {
        sounds: {
            background: backgroundMusic,
            hit: hitSound,
            bounce: bounceSound,
        },
    };
}

async function addScore(scene: Scene) {
    // Load font data once and cache it
    if (!fontData) fontData = await (await fetch("assets/Montserrat_Regular.json")).json();
    if (scoreText) scoreText.dispose();

    // Create initial score text
    const text = CreateText("scoreText", `Score: ${score.player1} - ${score.player2}`, fontData, {
        size: 0.5, // text size
        depth: 0.1, // extrusion depth
        resolution: 32, // curve resolution
    });

    if (!text) throw new Error("Failed to create score text");
    scoreText = text;
    scoreText.position = SCORE_POSITION;
    scoreText.rotation.x = Math.PI / 2;
}

function setupKeyboardControls(scene: Scene) {
    let lastDirection: "up" | "down" | "stop" = "stop";

    document.addEventListener("keydown", (event) => {
        console.log(`Key pressed: ${event.key}`);
        if (event.key === "ArrowUp" || event.key === "w") {
            sendDirection("up");
        } else if (event.key === "ArrowDown" || event.key === "s") {
            sendDirection("down");
        }
    });

    window.addEventListener("keyup", (event) => {
        console.log(`Key released: ${event.key}`);
        if (["ArrowUp", "ArrowDown", "w", "s"].includes(event.key)) {
            sendDirection("stop");
        }
    });

    function sendDirection(direction: "up" | "down" | "stop") {
        if (direction !== lastDirection && socket.readyState === WebSocket.OPEN) {
            socket.send(`move ${direction}`);
            lastDirection = direction;
        }
    }
}

function updateGameObjects(eventData: any, scene: Scene) {
    const gameState = JSON.parse(eventData);
    if (!gameState || !gameRunning) return;
    console.log("Updated game state received:", gameState);
    // Update ball position if it exists
    if (gameState.ballPosition && ball) {
        ball.position.x = gameState.ballPosition.x;
        ball.position.z = gameState.ballPosition.z;
    }

    // Update paddle positions
    if (gameState.paddlePosition) {
        if (paddle1) {
            paddle1.position.z = gameState.paddlePosition["player-1"].z;
        }
        if (paddle2) {
            paddle2.position.z = gameState.paddlePosition["player-2"].z;
        }
    }

    // Update score if needed
    if (
        gameState.score &&
        (score.player1 !== gameState.score.player1 || score.player2 !== gameState.score.player2)
    ) {
        score = gameState.score;
        addScore(scene);
    }
}
