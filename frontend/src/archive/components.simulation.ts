// import {
//     ArcRotateCamera,
//     AssetsManager,
//     BackgroundMaterial,
//     Color3,
//     CubeTexture,
//     Engine,
//     Mesh,
//     MeshBuilder,
//     Scene,
//     StandardMaterial,
//     Texture,
//     Vector3,
// } from "@babylonjs/core";
// import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

// let GAME_CONSTANTS = {
//     PADDLE_WIDTH: 0.5,
//     PADDLE_HEIGHT: 0.5,
//     PADDLE_DEPTH: 15,
//     BALL_RADIUS: 0.4,
//     BOARD_WIDTH: 40,
//     BOARD_HEIGHT: 0.3,
//     BOARD_DEPTH: 30,
//     PADDLE_SPEED: 0.3,
//     BALL_SPEED: 0.5,
// };

// let ball: Mesh;
// let paddle1: Mesh;
// let paddle2: Mesh;

// export async function createSimulation(): Promise<HTMLElement[]> {
//     const container = document.createElement("div");
//     container.className = "w-screen h-screen"; // Set explicit height

//     const gameSection = document.createElement("canvas");
//     gameSection.className = "w-screen h-screen";
//     gameSection.id = "renderCanvas"; // Add an ID for easier reference

//     // Add a play button
//     const playButton = document.createElement("button");
//     playButton.textContent = "Click to Start Game";
//     playButton.className = "container mx-auto";

//     container.appendChild(playButton);
//     container.appendChild(gameSection);

//     container.addEventListener("destroy", () => {
//         log.info("received destroy");
//     });

//     // Initialize game only after user interaction
//     playButton.addEventListener("click", () => {
//         playButton.remove();
//         initialiseGame(gameSection);
//     });

//     return [container];
// }

// async function initialiseGame(gameSection: HTMLCanvasElement) {
//     const engine = new Engine(gameSection);

//     const createScene = async function () {
//         const scene = new Scene(engine);

//         // Set up the scene first
//         setScene(scene);
//         const assetsManager = await addModels(scene);

//         // Then create game objects
//         const { board, paddle1, paddle2, ball } = await createGameObjects(scene);

//         const camera = await setCamera(scene, ball);

//         assetsManager.onFinish = function (tasks) {
//             engine.runRenderLoop(function () {
//                 scene.render();
//             });
//         };

//         assetsManager.load();

//         scene.registerBeforeRender(() => {
//             camera.alpha += 0.003; // Rotates around Y-axis
//         });

//         return scene;
//     };

//     createScene().then((scene) => {
//         engine.runRenderLoop(() => {
//             scene.render();
//         });
//         // Handle window resize
//         window.addEventListener("resize", () => {
//             engine.resize();
//         });
//     });
// }

// function setScene(scene: Scene): Scene {
//     // Create a ground
//     const ground = MeshBuilder.CreateBox(
//         "ground",
//         {
//             width: 100,
//             height: 0.1,
//             depth: 100,
//         },
//         scene
//     );
//     ground.position.y = -0.9;
//     const groundMaterial = new StandardMaterial("groundMaterial", scene);
//     groundMaterial.diffuseTexture = new Texture(`${CONST.DIR.ASSET}/ground.jpg`, scene);
//     ground.material = groundMaterial;
//     // Create default lighting
//     scene.createDefaultLight();
//     scene.fogMode = Scene.FOGMODE_LINEAR;
//     scene.fogDensity = 1;
//     scene.fogStart = 10.0;

//     const size = 1000;
//     const skydome = MeshBuilder.CreateBox("sky", { size, sideOrientation: Mesh.BACKSIDE }, scene);
//     skydome.position.y = 0.5;
//     skydome.receiveShadows = true;
//     const sky = new BackgroundMaterial("skyMaterial", scene);
//     sky.enableGroundProjection = true;
//     sky.projectedGroundRadius = 20;
//     sky.projectedGroundHeight = 3;
//     skydome.material = sky;
//     sky.reflectionTexture = new CubeTexture(`${CONST.DIR.ASSET}/skybox/`, scene, [
//         "px.png",
//         "py.png",
//         "pz.png",
//         "nx.png",
//         "ny.png",
//         "nz.png",
//     ]);

//     return scene;
// }

// async function addModels(scene: Scene): Promise<AssetsManager> {
//     registerBuiltInLoaders();
//     var assetsManager = new AssetsManager(scene);

//     var meshTask1 = assetsManager.addMeshTask(
//         "asset task 1",
//         "",
//         "assets/textures/",
//         "aldrich.glb"
//     );
//     var meshTask2 = assetsManager.addMeshTask(
//         "asset task 2",
//         "",
//         CONST.DIR.TEXTURE,
//         "dragon.glb"
//     );
//     var meshTask3 = assetsManager.addMeshTask(
//         "asset task 3",
//         "",
//         CONST.DIR.TEXTURE,
//         "mythcreature.glb"
//     );
//     var meshTask4 = assetsManager.addMeshTask(
//         "asset task 4",
//         "",
//         CONST.DIR.TEXTURE,
//         "mythcreature.glb"
//     );

//     const positions = [
//         new Vector3(-GAME_CONSTANTS.BOARD_WIDTH / 2 - 10, 0, 0), // Left
//         new Vector3(GAME_CONSTANTS.BOARD_WIDTH / 2 + 10, -1, 0), // Right
//         new Vector3(0, 0, -GAME_CONSTANTS.BOARD_DEPTH / 2 - 10), // Front
//         new Vector3(0, 0, GAME_CONSTANTS.BOARD_DEPTH / 2 + 10), // Back
//     ];

//     const rotations = [
//         new Vector3(0, -Math.PI / 2, 0), // Left
//         new Vector3(0, -Math.PI / 2, 0), // Right
//         new Vector3(0, 0, 0), // Front
//         new Vector3(0, Math.PI, 0), // Back
//     ];

//     meshTask1.onSuccess = function (task) {
//         const mesh = task.loadedMeshes[0];
//         mesh.position = positions[0];
//         mesh.scaling = new Vector3(1, 1, 1);
//         mesh.rotation = rotations[0];
//     };

//     meshTask2.onSuccess = function (task) {
//         const mesh = task.loadedMeshes[0];
//         mesh.position = positions[1];
//         mesh.scaling = new Vector3(1, 1, 1);
//         mesh.rotation = rotations[1];
//     };

//     meshTask3.onSuccess = function (task) {
//         const mesh = task.loadedMeshes[0];
//         mesh.position = positions[2];
//         mesh.scaling = new Vector3(4, 4, 4);
//         mesh.rotation = rotations[2];
//     };

//     meshTask4.onSuccess = function (task) {
//         const mesh = task.loadedMeshes[0];
//         mesh.position = positions[3];
//         mesh.scaling = new Vector3(4, 4, 4);
//         mesh.rotation = rotations[3];
//     };

//     meshTask1.onError = function (task, message, exception) {
//         log.info(message, exception);
//     };

//     meshTask2.onError = function (task, message, exception) {
//         log.info(message, exception);
//     };

//     meshTask3.onError = function (task, message, exception) {
//         log.info(message, exception);
//     };

//     meshTask4.onError = function (task, message, exception) {
//         log.info(message, exception);
//     };

//     return assetsManager;
// }

// async function setCamera(scene: Scene, ball: Mesh): Promise<ArcRotateCamera> {
//     const camera = new ArcRotateCamera(
//         "Camera",
//         Math.PI / 2,
//         Math.PI / 2.1,
//         8,
//         ball.position,
//         scene
//     );
//     camera.radius = 10;

//     return camera;
// }

// async function createGameObjects(scene: Scene): Promise<{
//     board: Mesh;
//     paddle1: Mesh;
//     paddle2: Mesh;
//     ball: Mesh;
// }> {
//     const middleLine = MeshBuilder.CreateGround(
//         "middleLine",
//         {
//             width: 0.1,
//             height: GAME_CONSTANTS.BOARD_DEPTH,
//         },
//         scene
//     );
//     middleLine.position = new Vector3(0, -0.32, 0);
//     middleLine.rotation = new Vector3(0, 0, 0);
//     const middleLineMaterial = new StandardMaterial("middleLine", scene);
//     middleLineMaterial.diffuseColor = new Color3(1, 1, 1);
//     middleLineMaterial.specularColor = new Color3(1, 0, 0);
//     middleLine.material = middleLineMaterial;
//     // Create game board
//     const board = MeshBuilder.CreateBox(
//         "board",
//         {
//             width: GAME_CONSTANTS.BOARD_WIDTH,
//             height: GAME_CONSTANTS.BOARD_HEIGHT,
//             depth: GAME_CONSTANTS.BOARD_DEPTH,
//         },
//         scene
//     );
//     board.position.y = -0.5;
//     const boardMaterial = new StandardMaterial("board", scene);
//     boardMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
//     boardMaterial.specularColor = new Color3(1, 0, 0);
//     board.material = boardMaterial;

//     const paddleMaterial = new StandardMaterial("paddle", scene);
//     paddleMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
//     // Create paddles
//     paddle1 = MeshBuilder.CreateBox(
//         "paddle1",
//         {
//             width: GAME_CONSTANTS.PADDLE_WIDTH,
//             height: GAME_CONSTANTS.PADDLE_HEIGHT,
//             depth: GAME_CONSTANTS.PADDLE_DEPTH,
//         },
//         scene
//     );
//     paddle1.position = new Vector3(-GAME_CONSTANTS.BOARD_WIDTH / 2 + 0.2, -0.2, 0);
//     paddle1.rotation.x = Math.PI;
//     paddle1.material = paddleMaterial;

//     paddle2 = MeshBuilder.CreateBox(
//         "paddle2",
//         {
//             width: GAME_CONSTANTS.PADDLE_WIDTH,
//             height: GAME_CONSTANTS.PADDLE_HEIGHT,
//             depth: GAME_CONSTANTS.PADDLE_DEPTH,
//         },
//         scene
//     );
//     paddle2.position = new Vector3(GAME_CONSTANTS.BOARD_WIDTH / 2 - 0.2, -0.2, 0);
//     paddle2.rotation.x = Math.PI;
//     paddle2.material = paddleMaterial;

//     // Create ball
//     ball = MeshBuilder.CreateSphere(
//         "ball",
//         {
//             diameter: GAME_CONSTANTS.BALL_RADIUS * 2,
//         },
//         scene
//     );
//     ball.position = new Vector3(0, 0.05, 0);
//     const ballMaterial = new StandardMaterial("ball", scene);
//     ballMaterial.diffuseColor = new Color3(1, 0, 0);
//     ball.material = ballMaterial;
//     return { board, ball, paddle1, paddle2 };
// }
