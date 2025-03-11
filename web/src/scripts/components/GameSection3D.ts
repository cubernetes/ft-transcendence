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
    Color4,
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
let ballDirection = new Vector3(BALL_SPEED, 0, BALL_SPEED);
let keysPressed: { [key: string]: boolean } = {};
let fontData: any = null;

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

    // Initialize game only after user interaction
    playButton.addEventListener("click", () => {
        playButton.remove();
        initialiseGame(gameSection, container);
    });

    return container;
}

function initialiseGame(gameSection: HTMLCanvasElement, container: HTMLElement) {
    const engine = new Engine(gameSection);

    const createScene = async function () {
        const scene = new Scene(engine);

        setScene(scene);
        setCamera(scene);
        createGameObjects(scene);
        await addScore(scene);
        await addMusic(scene);
        setupKeyboardControls(scene);

        scene.registerBeforeRender(() => {
            updateGame(scene);
        });

        //Inspector tool for debugging
        //Inspector.Show(scene, {});

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
    ball.position = new Vector3(0, 0.5, 0);
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
    // Setup keyboard event listeners
    window.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
        }
        keysPressed[event.key] = true;
    });
    window.addEventListener("keyup", (event) => {
        keysPressed[event.key] = false;
    });
}

function updateGame(scene: Scene) {
    // Handle paddle movement
    if (keysPressed["w"]) {
        paddle1.position.z += PADDLE_SPEED;
        if (paddle1.position.z > BOARD_DEPTH / 2 - PADDLE_DEPTH / 2) {
            paddle1.position.z = BOARD_DEPTH / 2 - PADDLE_DEPTH / 2;
        }
    }

    if (keysPressed["s"]) {
        paddle1.position.z -= PADDLE_SPEED;
        if (paddle1.position.z < -BOARD_DEPTH / 2 + PADDLE_DEPTH / 2) {
            paddle1.position.z = -BOARD_DEPTH / 2 + PADDLE_DEPTH / 2;
        }
    }

    if (keysPressed["ArrowUp"]) {
        paddle2.position.z += PADDLE_SPEED;
        if (paddle2.position.z > BOARD_DEPTH / 2 - PADDLE_DEPTH / 2) {
            paddle2.position.z = BOARD_DEPTH / 2 - PADDLE_DEPTH / 2;
        }
    }

    if (keysPressed["ArrowDown"]) {
        paddle2.position.z -= PADDLE_SPEED;
        if (paddle2.position.z < -BOARD_DEPTH / 2 + PADDLE_DEPTH / 2) {
            paddle2.position.z = -BOARD_DEPTH / 2 + PADDLE_DEPTH / 2;
        }
    }

    // Update ball position
    ball.position.x += ballDirection.x;
    ball.position.z += ballDirection.z;

    // Ball collision with paddles
    if (
        ball.position.x <= paddle1.position.x + PADDLE_WIDTH / 2 + BALL_RADIUS &&
        ball.position.x >= paddle1.position.x - PADDLE_WIDTH / 2 - BALL_RADIUS &&
        ball.position.z <= paddle1.position.z + PADDLE_DEPTH / 2 + BALL_RADIUS &&
        ball.position.z >= paddle1.position.z - PADDLE_DEPTH / 2 - BALL_RADIUS
    ) {
        ballDirection.x = Math.abs(ballDirection.x); // Reverse x direction
        // Play bounce sound if available
        if (scene.metadata?.sounds?.bounce) scene.metadata.sounds.bounce.play();
    }

    if (
        ball.position.x >= paddle2.position.x - PADDLE_WIDTH / 2 - BALL_RADIUS &&
        ball.position.x <= paddle2.position.x + PADDLE_WIDTH / 2 + BALL_RADIUS &&
        ball.position.z <= paddle2.position.z + PADDLE_DEPTH / 2 + BALL_RADIUS &&
        ball.position.z >= paddle2.position.z - PADDLE_DEPTH / 2 - BALL_RADIUS
    ) {
        ballDirection.x = -Math.abs(ballDirection.x); // Reverse x direction
        // Play bounce sound if available
        if (scene.metadata?.sounds?.bounce) scene.metadata.sounds.bounce.play();
    }

    // Ball collision with top and bottom walls
    if (
        ball.position.z >= BOARD_DEPTH / 2 - BALL_RADIUS ||
        ball.position.z <= -BOARD_DEPTH / 2 + BALL_RADIUS
    ) {
        ballDirection.z = -ballDirection.z; // Reverse z direction
        if (scene.metadata?.sounds?.bounce) scene.metadata.sounds.bounce.play();
    }

    // Ball out of bounds (scoring)
    if (ball.position.x < -BOARD_WIDTH / 2) {
        // Player 2 scores
        if (scene.metadata?.sounds?.hit) scene.metadata.sounds.hit.play();
        score.player2++;
        resetBall();
        addScore(scene);
    } else if (ball.position.x > BOARD_WIDTH / 2) {
        // Player 1 scores
        if (scene.metadata?.sounds?.hit) scene.metadata.sounds.hit.play();
        score.player1++;
        resetBall();
        addScore(scene);
    }
}

function resetBall() {
    // Reset ball position immediately
    ball.position = new Vector3(0, 0.5, 0);

    // Stop the ball temporarily
    ballDirection.x = 0;
    ballDirection.z = 0;

    setTimeout(() => {
        // Randomize ball direction
        const randomAngle = Math.random() * Math.PI * 2;
        ballDirection.x = BALL_SPEED * Math.cos(randomAngle);
        ballDirection.z = BALL_SPEED * Math.sin(randomAngle);

        if (Math.abs(ballDirection.x) < 0.3 * BALL_SPEED) {
            ballDirection.x = ballDirection.x > 0 ? 0.3 * BALL_SPEED : -0.3 * BALL_SPEED;
        }
    }, 1500);
}
