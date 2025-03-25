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
    UniversalCamera,
    AssetsManager,
    Color4,
} from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";
import earcut from "earcut";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
(window as any).earcut = earcut;

// Default game constants (will be overridden by server values)
let GAME_CONSTANTS = {
    PADDLE_WIDTH: 1,
    PADDLE_HEIGHT: 1,
    PADDLE_DEPTH: 25,
    BALL_RADIUS: 0.3,
    BOARD_WIDTH: 40,
    BOARD_HEIGHT: 0.3,
    BOARD_DEPTH: 30,
    PADDLE_SPEED: 0.3,
    BALL_SPEED: 0.5,
};

const SCORE_POSITION = new Vector3(0, 0, 8);

// Game state
let score = { player1: 0, player2: 0 };
let scoreText: Mesh;
let ball: Mesh;
let paddle1: Mesh;
let paddle2: Mesh;
let fontData: any = null;
let socket: WebSocket;
let gameRunning = false;
let lastCollisionEvents: any[] = [];

export async function createSimulation(): Promise<HTMLElement> {
    const container = document.createElement("div");
    container.className = "w-screen h-screen"; // Set explicit height

    const gameSection = document.createElement("canvas");
    gameSection.className = "w-screen h-screen";
    gameSection.id = "renderCanvas"; // Add an ID for easier reference

    // Add a play button
    const playButton = document.createElement("button");
    playButton.textContent = "Click to Start Game";
    playButton.className = "container mx-auto";

    // Add Sound effects
    const backgroundMusic = document.createElement("audio");
    backgroundMusic.src = "assets/neon-gaming.mp3";
    backgroundMusic.loop = true;
    const bounceMusic = document.createElement("audio");
    bounceMusic.src = "assets/bounce.mp3";
    const hitMusic = document.createElement("audio");
    hitMusic.src = "assets/hit.mp3";
    const soundEffects = [backgroundMusic, bounceMusic, hitMusic];

    container.appendChild(playButton);
    container.appendChild(gameSection);

    socket = new WebSocket("/ws");

    socket.onopen = () => {
        console.log("WebSocket connection established.");
    };

    container.addEventListener("destroy", () => {
        console.log("received destroy");
        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
        if (bounceMusic) bounceMusic.pause();
        if (hitMusic) hitMusic.pause();
    });

    // Initialize game only after user interaction
    playButton.addEventListener("click", () => {
        playButton.remove();
        socket.send("join player-1");
        if (socket.readyState === WebSocket.OPEN) {
            console.log("Sending startPong");
            socket.send("startPong"); // Start the game
        } else {
            console.error("WebSocket is not open.");
        }
        gameRunning = true;
        backgroundMusic.play();
        initialiseGame(gameSection, soundEffects);
    });

    socket.onerror = (error) => {
        console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed.");
    };

    return container;
}

async function initialiseGame(gameSection: HTMLCanvasElement, soundEffects: HTMLAudioElement[]) {
    const engine = new Engine(gameSection);

    const createScene = async function () {
        const scene = new Scene(engine);

        // Set up the scene first
        setScene(scene);
        const assetsManager = await addModels(scene);

        // Then create game objects
        const { board, paddle1, paddle2, ball } = await createGameObjects(scene);

        const camera = await setCamera(scene, ball);

        camera.attachControl(gameSection, true);

        // Set up controls
        setupKeyboardControls(scene);

        assetsManager.onFinish = function (tasks) {
            engine.runRenderLoop(function () {
                scene.render();
            });
        };

        assetsManager.load();

        // Set up WebSocket message handler AFTER everything is initialized
        socket.onmessage = (event) => {
            updateGameObjects(event.data, scene, soundEffects);
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

function setScene(scene: Scene): Scene {
    // Create a skybox
    const skybox = MeshBuilder.CreateBox(
        "skybox",
        {
            width: 100,
            height: 0.1,
            depth: 100,
        },
        scene
    );
    skybox.position.y = -0.9;
    const skyboxMaterial = new StandardMaterial("skyboxMaterial", scene);
    skyboxMaterial.diffuseTexture = new Texture("./assets/ground.jpg", scene);
    skybox.material = skyboxMaterial;
    // Create default lighting
    scene.createDefaultLight();
    scene.fogMode = Scene.FOGMODE_EXP;
    scene.fogDensity = 0.0;
    scene.clearColor = new Color4(1, 0, 0, 1);

    return scene;
}

async function addModels(scene: Scene): Promise<AssetsManager> {
    registerBuiltInLoaders();
    var assetsManager = new AssetsManager(scene);

    var meshTask1 = assetsManager.addMeshTask("asset task 1", "", "assets/", "aldrich.glb");
    var meshTask2 = assetsManager.addMeshTask("asset task 2", "", "assets/", "dragon.glb");
    var meshTask3 = assetsManager.addMeshTask("asset task 3", "", "assets/", "mythcreature.glb");
    var meshTask4 = assetsManager.addMeshTask("asset task 4", "", "assets/", "mythcreature.glb");

    const positions = [
        new Vector3(-GAME_CONSTANTS.BOARD_WIDTH / 2 - 10, 0, 0), // Left
        new Vector3(GAME_CONSTANTS.BOARD_WIDTH / 2 + 10, -1, 0), // Right
        new Vector3(0, 0, -GAME_CONSTANTS.BOARD_DEPTH / 2 - 10), // Front
        new Vector3(0, 0, GAME_CONSTANTS.BOARD_DEPTH / 2 + 10), // Back
    ];

    const rotations = [
        new Vector3(0, -Math.PI / 2, 0), // Left
        new Vector3(0, -Math.PI / 2, 0), // Right
        new Vector3(0, 0, 0), // Front
        new Vector3(0, Math.PI, 0), // Back
    ];

    meshTask1.onSuccess = function (task) {
        const mesh = task.loadedMeshes[0];
        mesh.position = positions[0];
        mesh.scaling = new Vector3(1, 1, 1);
        mesh.rotation = rotations[0];
    };

    meshTask2.onSuccess = function (task) {
        const mesh = task.loadedMeshes[0];
        mesh.position = positions[1];
        mesh.scaling = new Vector3(1, 1, 1);
        mesh.rotation = rotations[1];
    };

    meshTask3.onSuccess = function (task) {
        const mesh = task.loadedMeshes[0];
        mesh.position = positions[2];
        mesh.scaling = new Vector3(5, 5, 5);
        mesh.rotation = rotations[2];
    };

    meshTask4.onSuccess = function (task) {
        const mesh = task.loadedMeshes[0];
        mesh.position = positions[3];
        mesh.scaling = new Vector3(5, 5, 5);
        mesh.rotation = rotations[3];
    };

    meshTask1.onError = function (task, message, exception) {
        console.log(message, exception);
    };

    meshTask2.onError = function (task, message, exception) {
        console.log(message, exception);
    };

    meshTask3.onError = function (task, message, exception) {
        console.log(message, exception);
    };

    meshTask4.onError = function (task, message, exception) {
        console.log(message, exception);
    };

    return assetsManager;
}

async function setCamera(scene: Scene, ball: Mesh): Promise<UniversalCamera> {
    const camera = new UniversalCamera("UniversalCamera", new Vector3(0, 20, -30), scene);
    camera.setTarget(Vector3.Zero());
    return camera;
}

async function createGameObjects(scene: Scene): Promise<{
    board: Mesh;
    paddle1: Mesh;
    paddle2: Mesh;
    ball: Mesh;
}> {
    const middleLine = MeshBuilder.CreateGround(
        "middleLine",
        {
            width: 0.1,
            height: GAME_CONSTANTS.BOARD_DEPTH,
        },
        scene
    );
    middleLine.position = new Vector3(0, -0.25, 0);
    middleLine.rotation = new Vector3(0, 0, 0);
    const middleLineMaterial = new StandardMaterial("middleLine", scene);
    middleLineMaterial.diffuseColor = new Color3(1, 1, 1);
    middleLineMaterial.specularColor = new Color3(1, 0, 0);
    middleLine.material = middleLineMaterial;
    // Create game board
    const board = MeshBuilder.CreateBox(
        "board",
        {
            width: GAME_CONSTANTS.BOARD_WIDTH,
            height: GAME_CONSTANTS.BOARD_HEIGHT,
            depth: GAME_CONSTANTS.BOARD_DEPTH,
        },
        scene
    );
    board.position.y = -0.5;
    const boardMaterial = new StandardMaterial("board", scene);
    boardMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
    boardMaterial.specularColor = new Color3(1, 0, 0);
    board.material = boardMaterial;

    const paddleMaterial = new StandardMaterial("paddle", scene);
    paddleMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
    // Create paddles
    paddle1 = MeshBuilder.CreateBox(
        "paddle1",
        {
            width: GAME_CONSTANTS.PADDLE_WIDTH,
            height: GAME_CONSTANTS.PADDLE_HEIGHT,
            depth: GAME_CONSTANTS.PADDLE_DEPTH,
        },
        scene
    );
    paddle1.position = new Vector3(-GAME_CONSTANTS.BOARD_WIDTH / 2 + 0.2, 0.2, 0);
    paddle1.rotation.x = Math.PI;
    paddle1.material = paddleMaterial;

    paddle2 = MeshBuilder.CreateBox(
        "paddle2",
        {
            width: GAME_CONSTANTS.PADDLE_WIDTH,
            height: GAME_CONSTANTS.PADDLE_HEIGHT,
            depth: GAME_CONSTANTS.PADDLE_DEPTH,
        },
        scene
    );
    paddle2.position = new Vector3(GAME_CONSTANTS.BOARD_WIDTH / 2 - 0.2, 0.2, 0);
    paddle2.rotation.x = Math.PI;
    paddle2.material = paddleMaterial;

    // Create ball
    ball = MeshBuilder.CreateSphere(
        "ball",
        {
            diameter: GAME_CONSTANTS.BALL_RADIUS * 2,
        },
        scene
    );
    ball.position = new Vector3(0, 0, 0);
    const ballMaterial = new StandardMaterial("ball", scene);
    ballMaterial.diffuseColor = new Color3(1, 0, 0);
    ball.material = ballMaterial;
    return { board, ball, paddle1, paddle2 };
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

function updateGameObjects(eventData: any, scene: Scene, soundEffects: HTMLAudioElement[]) {
    const gameState = JSON.parse(eventData);
    if (!gameState || !gameRunning) return;
    //console.log("Updated game state received:", gameState);

    // Update ball position if it exists
    if (gameState.ballPosition && ball) {
        ball.position.x = gameState.ballPosition.x;
        ball.position.y = gameState.ballPosition.y;
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
        // addScore(scene);
    }

    // Play sounds based on collision events
    if (gameState.collisionEvents && gameState.collisionEvents.length > 0) {
        // Get only new events by comparing timestamps
        const newEvents = gameState.collisionEvents.filter(
            (event: any) => !lastCollisionEvents.some((e: any) => e.timestamp === event.timestamp)
        );

        if (newEvents.length > 0) {
            console.log("New collision events:", newEvents);

            // Update last collision events
            lastCollisionEvents = gameState.collisionEvents;
        }
    }
}
