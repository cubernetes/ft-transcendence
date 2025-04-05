import {
    Animation,
    ArcRotateCamera,
    Axis,
    BackgroundMaterial,
    Color3,
    CreateAudioEngineAsync,
    CreateGroundFromHeightMap,
    CreateSoundAsync,
    CreateStreamingSoundAsync,
    CubeTexture,
    DirectionalLight,
    Mesh,
    MeshBuilder,
    Scene,
    ShadowGenerator,
    SoundState,
    Space,
    StandardMaterial,
    Texture,
    Vector3,
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Grid,
    Slider,
    StackPanel,
    TextBlock,
} from "@babylonjs/gui";
import { defaultGameConfig } from "@darrenkuro/pong-core";
import { ASSETS_DIR } from "../config";
import { gameConfig } from "./game.config";
import { BabylonObjects } from "./game.types";

export class SceneSetup {
    static createScene(babylon: BabylonObjects): void {
        // --------- SCENE
        const scene = new Scene(babylon.engine);
        scene.audioEnabled = true;

        // --------- LIGHT
        const light = new DirectionalLight("directionalLight", new Vector3(0, -8, 4), scene);

        // light.intensity = 0.5;
        light.shadowMinZ = 3.5;
        light.shadowMaxZ = 15;
        // light.shadowEnabled
        // light.autoUpdateExtends = false;
        // light.autoCalcShadowZBounds = true;

        // --------- SHADOWS
        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.setDarkness(0.5);
        // shadowGenerator.useBlurExponentialShadowMap = true;
        // shadowGenerator.forceBackFacesOnly = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 64;
        // shadowGenerator.useExponentialShadowMap = true;

        // --------- CONTROLS
        var controls = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        babylon.scene = scene;
        babylon.light = light;
        babylon.shadowGenerator = shadowGenerator;
        babylon.controls = controls;
    }

    static createControls(babylon: BabylonObjects): void {
        // Create a grid
        var grid = new Grid();
        babylon.controls.addControl(grid);

        grid.addColumnDefinition(0.2);
        grid.addColumnDefinition(0.2);
        grid.addColumnDefinition(0.2);
        grid.addColumnDefinition(0.1);
        grid.addColumnDefinition(0.1);
        grid.addColumnDefinition(0.2);
        grid.addRowDefinition(0.07);
        grid.addRowDefinition(0.25);
        grid.addRowDefinition(0.25);
        grid.addRowDefinition(0.25);

        // -------------- Button: SHADOWS
        var shadowButton = Button.CreateSimpleButton("shadowToggle", "Shadows");
        shadowButton.width = "100px";
        shadowButton.height = "35px";
        shadowButton.color = "white";
        shadowButton.cornerRadius = 20;
        shadowButton.background = "gray";

        shadowButton.onPointerUpObservable.add(() => {
            if (babylon.shadowsEnabled) {
                babylon.shadowsEnabled = false;
                babylon.shadowGenerator.getShadowMap()?.renderList?.splice(0);
                shadowButton.textBlock!.text = "Shadows";
                shadowButton.background = "gray";
            } else {
                babylon.shadowsEnabled = true;
                babylon.shadowGenerator.addShadowCaster(babylon.paddle1);
                babylon.shadowGenerator.addShadowCaster(babylon.paddle2);
                babylon.shadowGenerator.addShadowCaster(babylon.ball);
                shadowButton.textBlock!.text = "Shadows";
                shadowButton.background = "blue";
            }
        });
        grid.addControl(shadowButton, 0, 2);

        // ----------------- Button: Mute/Play SFX
        var buttonSFX = Button.CreateSimpleButton("sfx", "SFX");
        buttonSFX.fontSize = 15;
        buttonSFX.fontFamily = "Cambria";
        buttonSFX.fontStyle = "italic";
        buttonSFX.height = "35px";
        buttonSFX.width = "60px";
        buttonSFX.color = "white";
        buttonSFX.cornerRadius = 20;
        buttonSFX.background = "green";
        buttonSFX.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        buttonSFX.onPointerUpObservable.add(function () {
            if (babylon.soundsEnabled) {
                babylon.soundsEnabled = false;
                buttonSFX.background = "red";
            } else {
                babylon.soundsEnabled = true;
                buttonSFX.background = "green";
            }
        });
        grid.addControl(buttonSFX, 0, 3);

        // ----------------- Button: Mute/Play MUSIC
        var buttonMusic = Button.CreateSimpleButton("bgMusic", "Music");
        buttonMusic.fontSize = 15;
        buttonMusic.fontFamily = "Cambria";
        buttonMusic.fontStyle = "italic";
        buttonMusic.height = "35px";
        buttonMusic.width = "60px";
        buttonMusic.color = "white";
        buttonMusic.cornerRadius = 20;
        buttonMusic.background = "green";
        buttonMusic.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        buttonMusic.onPointerUpObservable.add(function () {
            if (babylon.bgMusic.state === SoundState.Started) {
                babylon.bgMusic.pause();
                buttonMusic.background = "red";
                // buttonMusic.textBlock!.text = "Play\nMusic";
            } else {
                babylon.bgMusic.play();
                buttonMusic.background = "green";
                // buttonMusic.textBlock!.text = "Mute\nMusic";
            }
        });
        grid.addControl(buttonMusic, 0, 4);

        // ---------------- Button: VOLUME
        var panelVol = new StackPanel();
        panelVol.width = "220px";
        grid.addControl(panelVol, 0, 6);

        var header = new TextBlock();
        header.text = "Volume: 50 %";
        header.fontSize = 16;
        header.fontStyle = "italic";
        header.fontFamily = "Calibri";
        header.height = "15px";
        header.color = "white";
        panelVol.addControl(header);

        var slider2 = new Slider();
        slider2.minimum = 0;
        slider2.maximum = 100;
        slider2.value = 50;
        slider2.height = "20px";
        slider2.width = "100px";
        slider2.color = "lightblue";
        slider2.background = "black";
        slider2.displayThumb = false;
        slider2.blur;
        slider2.onValueChangedObservable.add(function (value) {
            header.text = "Volume: " + (value | 0) + " %";
            babylon.bgMusic.volume = value / 100;
        });
        panelVol.addControl(slider2);

        // Create a image-slider
        // var slider = new ImageBasedSlider();
        // slider.minimum = 0;
        // slider.maximum = 100;
        // slider.value = 100;
        // slider.height = "20px";
        // slider.width = "200px";
        // slider.isThumbClamped = true;
        // // slider.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        // slider.backgroundImage = new Image("back", "/assets/bgSlider.png");
        // slider.valueBarImage = new Image("value", "/assets/fgSlider.png");
        // slider.thumbImage = new Image("thumb", "/assets/knSlider.png");
        // slider.onValueChangedObservable.add(function(value) {
        //     header.text = "Volume: " + (value | 0) + " %";
        //     bgMusic.volume = value / 100;
        // });
        // panelVol.addControl(slider);
    }

    static setupScene(scene: Scene): void {
        // Create a background -> SKYBOX
        const sky = new BackgroundMaterial("skyMaterial", scene);
        sky.backFaceCulling = false;
        sky.reflectionTexture = new CubeTexture(`${ASSETS_DIR}/skybox/`, scene, [
            "px.png",
            "py.png",
            "pz.png",
            "nx.png",
            "ny.png",
            "nz.png",
        ]);
        sky.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

        const size = 1000;
        const skydome = MeshBuilder.CreateBox(
            "sky",
            { size, sideOrientation: Mesh.BACKSIDE },
            scene
        );
        skydome.position.y = 0.5;
        skydome.infiniteDistance = true;
        skydome.material = sky;
        skydome.rotate(Axis.Y, Math.PI, Space.LOCAL);

        scene.createDefaultLight();
    }

    static async createAudio(babylon: BabylonObjects): Promise<void> {
        const audioEngine = await CreateAudioEngineAsync();
        await audioEngine.unlockAsync();
        await audioEngine.createMainBusAsync("mainBus", { volume: 1.0 });

        const bgMusic = await CreateStreamingSoundAsync(
            "bgMusic",
            `${ASSETS_DIR}/audio/neon-gaming.mp3`,
            {
                loop: true,
                autoplay: true,
                volume: 0.5,
            },
            audioEngine
        );
        babylon.bgMusic = bgMusic;
        babylon.audioEngine = audioEngine;
    }

    static async createSounds(babylon: BabylonObjects): Promise<void> {
        const hitSound = await CreateSoundAsync("hitSound", `${ASSETS_DIR}/audio/hit.mp3`);
        hitSound.volume = 1;
        const bounceSound = await CreateSoundAsync("bounceSound", `${ASSETS_DIR}/audio/bounce.mp3`);
        bounceSound.volume = 1;
        const blopSound = await CreateSoundAsync("blopSound", `${ASSETS_DIR}/audio/blop.mp3`);
        blopSound.pitch = 1.5;
        const ballSound = await CreateSoundAsync("ballSound", `${ASSETS_DIR}/audio/tatata.mp3`);
        ballSound.playbackRate = 1.5;

        babylon.hitSound = hitSound;
        babylon.bounceSound = bounceSound;
        babylon.blopSound = blopSound;
        babylon.ballSound = ballSound;
    }

    static createFunctions(scene: Scene): void {
        // scene.onPointerDown = function castRay() {
        //     const picked = scene.pick(scene.pointerX, scene.pointerY);
        //     if (picked.pickedMesh) {
        //         blopSound.play();
        //     }
        // }

        // Create a function to handle window resizing
        window.addEventListener("resize", () => {
            scene.getEngine().resize();
        });

        // Create a function to handle window closing
        window.addEventListener("beforeunload", () => {
            scene.dispose();
        });
    }

    static setCamera(babylon: BabylonObjects): void {
        //TODO: check if Class TargetCamera makes more sense.
        const camera = new ArcRotateCamera(
            "pongCamera",
            -Math.PI / 2, // alpha - side view (fixed)
            Math.PI / 4,
            200, // radius - distance from center
            Vector3.Zero(), // target - looking at center
            babylon.scene
        );

        // Disable keyboard controls
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        // camera.inputs.clear();
        camera.attachControl(babylon.engine.getRenderingCanvas(), true);

        babylon.camera = camera;

        // ----- CAMERA SLIDE-IN ANIMATION -----
        // ------------ RADIUS
        var radAnim = new Animation("animCam", "radius", 10, Animation.ANIMATIONTYPE_FLOAT);
        var keysPosition = [];
        keysPosition.push({
            frame: 0,
            value: 200,
        });
        keysPosition.push({
            frame: 80,
            value: 40,
        });
        keysPosition.push({
            frame: 100,
            value: 25,
        });
        radAnim.setKeys(keysPosition);
        camera.animations.push(radAnim);

        // ------------ ALPHA
        var alphaAnim = new Animation("animCam", "alpha", 10, Animation.ANIMATIONTYPE_FLOAT);
        var keysPosition = [];
        keysPosition.push({
            frame: 0,
            value: -Math.PI,
        });
        keysPosition.push({
            frame: 50,
            value: 0,
        });
        keysPosition.push({
            frame: 100,
            value: -Math.PI / 2,
        });
        alphaAnim.setKeys(keysPosition);
        camera.animations.push(alphaAnim);

        function setCameraLimits(): void {
            // Set limits for zooming in/out
            camera.lowerRadiusLimit = 10;
            camera.upperRadiusLimit = 40;
            // Set limits for rotation up/down
            camera.lowerBetaLimit = 0.1;
            camera.upperBetaLimit = Math.PI / 2;
            // Set limits for rotation left/right
            camera.upperAlphaLimit = 0;
            camera.lowerAlphaLimit = -Math.PI;
        }

        babylon.scene.beginAnimation(camera, 0, 100, false, 1.0, setCameraLimits);
    }

    static createScore(score: [number, number], babylon: BabylonObjects): void {
        const scorePrint = MeshBuilder.CreateText(
            "scorePrint",
            `${score[0]} : ${score[1]}`,
            babylon.fontData,
            {
                size: 2,
                resolution: 8,
                depth: 1,
            },
            babylon.scene
        );
        scorePrint!.position = new Vector3(0, 1, defaultGameConfig.board.size.depth / 2 + 0.5);
        // scorePrint!.material = new StandardMaterial("scoreMat", babylon.scene);

        if (babylon.score) {
            babylon.score.dispose();
            babylon.score = null;
        }
        babylon.score = scorePrint!;
    }

    static async createGameObjects(babylon: BabylonObjects): Promise<void> {
        const defObj = defaultGameConfig; // as given from the PONG engine

        // Define consts -
        const positions = gameConfig.positions;
        const rotations = gameConfig.rotations;
        const materials = gameConfig.materials;

        const boardMaterial = new StandardMaterial("board", babylon.scene);
        boardMaterial.backFaceCulling = true; // Turn off back face culling to render both sides of the mesh
        boardMaterial.diffuseColor = materials.BOARD.diffuseColor;
        boardMaterial.specularColor = materials.BOARD.specularColor;

        const paddleMaterial = new StandardMaterial("paddle", babylon.scene);
        const paddleMaterial2 = new StandardMaterial("paddle1Mat", babylon.scene);
        // paddleMaterial2.alpha = 0.5;
        // paddleMaterial2.alphaMode = Material.MATERIAL_ALPHABLEND;
        paddleMaterial2.diffuseColor = new Color3(0, 0, 1);
        paddleMaterial2.backFaceCulling = false;

        // ------------- Create game board:
        // const board = MeshBuilder.CreateBox(
        //     "board",
        //     {
        //         width: objectConfigs.BOARD_WIDTH,
        //         height: objectConfigs.BOARD_HEIGHT,
        //         depth: objectConfigs.BOARD_DEPTH,
        //     },
        //     babylon.scene
        // );

        const board = CreateGroundFromHeightMap(
            "board",
            `${ASSETS_DIR}/height_map1.jpeg`,
            {
                width: defObj.board.size.width,
                height: defObj.board.size.depth,
                subdivisions: 50,
                maxHeight: 0.3,
                minHeight: -0.2,
            },
            babylon.scene
        );
        babylon.board = board;

        board.position = positions.BOARD;
        board.material = boardMaterial;
        // board.material.wireframe = true;
        board.receiveShadows = true;

        // --------------- Create SCORE
        var fontData = await (await fetch(`${ASSETS_DIR}/Montserrat_Regular.json`)).json();
        if (!fontData) {
            throw new Error("Failed to load font data");
        }
        babylon.fontData = fontData;
        this.createScore([0, 0], babylon);

        // ----------------- Create PADDLES
        const paddle1 = MeshBuilder.CreateSphere(
            "paddle1",
            {
                diameterX: defObj.paddles[0].size.width,
                diameterY: defObj.paddles[0].size.height,
                diameterZ: defObj.paddles[0].size.depth,
            },
            babylon.scene
        );
        paddle1.position = positions.PADDLE1;
        paddle1.rotation.x = rotations.PADDLE1;
        paddleMaterial.diffuseColor = materials.PADDLE1.diffuseColor;
        paddle1.material = paddleMaterial2;

        // const paddle2 = MeshBuilder.CreateBox(
        const paddle2 = MeshBuilder.CreateSphere(
            "paddle2",
            {
                diameterX: defObj.paddles[1].size.width,
                diameterY: defObj.paddles[1].size.height,
                diameterZ: defObj.paddles[1].size.depth,
            },
            babylon.scene
        );
        paddle2.position = positions.PADDLE2;
        paddle2.rotation.x = rotations.PADDLE2;
        paddleMaterial.diffuseColor = materials.PADDLE2.diffuseColor;
        paddle2.material = paddleMaterial2;

        // ----------------- Create BALL
        const ballMaterial = new StandardMaterial("ball", babylon.scene);
        // ballMaterial.wireframe = true;

        const ball = MeshBuilder.CreateSphere(
            "ball",
            {
                diameter: defObj.ball.r * 2,
            },
            babylon.scene
        );
        ball.position = positions.BALL;
        ballMaterial.diffuseColor = materials.BALL.diffuseColor;
        ball.material = ballMaterial;

        // ----------------- Create WALLS
        const cushions: Mesh[] = [];
        const cushionMaterial = new StandardMaterial("cushion", babylon.scene);
        cushionMaterial.diffuseColor = new Color3(0.7, 0, 0); // Red color for visibility

        const cushionPositions = [
            new Vector3(0, 0.1, defObj.board.size.depth / 2 + 0.5), // Top
            new Vector3(0, 0.1, -defObj.board.size.depth / 2 - 0.5), // Bottom
            new Vector3(defObj.board.size.width / 2 + 0.5, 0.1, 0), // Right
            new Vector3(-defObj.board.size.width / 2 - 0.5, 0.1, 0), // Left
        ];

        cushionPositions.forEach((pos) => {
            const cushion = MeshBuilder.CreateBox(
                "cushion",
                {
                    width: pos.z === 0 ? 1 : defObj.board.size.width + 2,
                    height: 0.2,
                    depth: pos.z === 0 ? defObj.board.size.depth + 2 : 1,
                },
                babylon.scene
            );

            cushion.position = pos;
            cushion.material = cushionMaterial;
            // babylon.shadowGenerator.addShadowCaster(cushion);
            cushions.push(cushion);
        });

        babylon.board = board;
        babylon.paddle1 = paddle1;
        babylon.paddle2 = paddle2;
        babylon.ball = ball;
    }

    // TODO: createScoreText(): Mesh {
}
