import {
    ArcRotateCamera,
    AudioEngineV2,
    Color3,
    CreateAudioEngineAsync,
    CreateGroundFromHeightMap,
    CreateSoundAsync,
    CreateStreamingSoundAsync,
    DirectionalLight,
    Mesh,
    MeshBuilder,
    Scene,
    ShadowGenerator,
    SoundState,
    StandardMaterial,
    StaticSound,
    StreamingSound,
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
import { ObjectConfig, gameConfig, getObjectConfigs } from "./game.config";
import { BabylonObjects } from "./game.types";

export class SceneSetup {
    static createScene(engine: any): {
        scene: Scene;
        light: DirectionalLight;
        shadowGenerator: ShadowGenerator;
        controls: AdvancedDynamicTexture;
    } {
        const scene = new Scene(engine);
        scene.audioEnabled = true;

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        // var hemisphericLight = new HemisphericLight(
        //     "hemisphericLight",
        //     new Vector3(0, 1, 0),
        //     scene
        // );
        // hemisphericLight.intensity = 0.7;

        const light = new DirectionalLight("directionalLight", new Vector3(0, -8, 4), scene);

        // const utilLayer = new UtilityLayerRenderer(scene, false, true);
        // const lightGiszmo = new LightGizmo(utilLayer);
        // lightGiszmo.light = light;

        // light.intensity = 0.5;
        light.shadowMinZ = 3.5;
        light.shadowMaxZ = 15;
        // light.shadowEnabled
        // light.autoUpdateExtends = false;
        // light.autoCalcShadowZBounds = true;

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.setDarkness(0.5);
        // shadowGenerator.useBlurExponentialShadowMap = true;
        // shadowGenerator.forceBackFacesOnly = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 64;
        // shadowGenerator.useExponentialShadowMap = true;

        // GUI
        var controls = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        return { scene, light, controls, shadowGenerator };
    }

    static createControls(babylon: BabylonObjects): void {
        // Create a grid
        var grid = new Grid();
        babylon.controls.addControl(grid);

        grid.addColumnDefinition(0.2);
        grid.addColumnDefinition(0.2);
        grid.addColumnDefinition(0.2);
        grid.addColumnDefinition(0.1);
        grid.addColumnDefinition(0.05);
        grid.addColumnDefinition(0.05);
        grid.addColumnDefinition(0.2);
        grid.addRowDefinition(0.07);
        grid.addRowDefinition(0.25);
        grid.addRowDefinition(0.25);
        grid.addRowDefinition(0.25);

        // // Create a clickable button
        // var button1 = Button.CreateSimpleButton("but1", "Click Me");
        // button1.width = "150px";
        // button1.height = "40px";
        // button1.color = "white";
        // button1.cornerRadius = 20;
        // button1.background = "green";
        // button1.onPointerUpObservable.add(function () {
        //     alert("You just clicked a button!");
        //     // controls.rootContainer.fontSize = "9px";
        //     //button1.children[0].fontSize = "9px";
        // });
        // controls.addControl(button1);

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
        grid.addControl(shadowButton, 0, 3);

        // ----------------- Button: Mute/Play Music
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
        grid.addControl(buttonMusic, 0, 5);

        // var buttonSFX = Button.CreateSimpleButton("sfx", "Mute\nSFX");

        // Create a volume-slider
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
        // Create a background
        const skybox = MeshBuilder.CreateBox(
            "skybox",
            {
                width: 100,
                height: 0.1,
                depth: 100,
            },
            scene
        );
        const skyboxMaterial = new StandardMaterial("skyboxMaterial", scene);
        skyboxMaterial.diffuseTexture = new Texture(
            `${ASSETS_DIR}/sky-clouds-background.jpg`,
            scene
        );
        skybox.material = skyboxMaterial;
        skybox.position.y = -1;

        scene.createDefaultLight();
    }

    // TODO: Check if audioEngine works like this
    static async createAudio(): Promise<{
        audioEngine: AudioEngineV2;
        bgMusic: StreamingSound;
    }> {
        const audioEngine = await CreateAudioEngineAsync();
        await audioEngine.unlockAsync();
        await audioEngine.createMainBusAsync("mainBus", { volume: 1.0 });

        const bgMusic = await CreateStreamingSoundAsync(
            "bgMusic",
            `${ASSETS_DIR}/neon-gaming.mp3`,
            {
                loop: true,
                autoplay: true,
                volume: 0.5,
            },
            audioEngine
        );
        return { audioEngine, bgMusic };
    }

    static async createSounds(): Promise<{
        hitSound: StaticSound;
        bounceSound: StaticSound;
        blopSound: StaticSound;
    }> {
        const hitSound = await CreateSoundAsync("hitSound", `${ASSETS_DIR}/hit.mp3`);
        hitSound.volume = 0.1;
        const bounceSound = await CreateSoundAsync("bounceSound", `${ASSETS_DIR}/bounce.mp3`);
        bounceSound.volume = 0.1;
        const blopSound = await CreateSoundAsync("blopSound", `${ASSETS_DIR}/blop.mp3`);
        blopSound.pitch = 1.5;

        return { hitSound, bounceSound, blopSound };
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

    static setCamera(scene: Scene): ArcRotateCamera {
        //TODO: check if Class TargetCamera makes more sense.
        const camera = new ArcRotateCamera(
            "pongCamera",
            -Math.PI / 2, // alpha - side view (fixed)
            0.1, // beta - slightly above (fixed)
            25, // radius - distance from center
            Vector3.Zero(), // target - looking at center
            scene
        );

        // Set limits for zooming in/out
        camera.lowerRadiusLimit = 10;
        camera.upperRadiusLimit = 40;
        // Set limits for rotation up/down
        camera.lowerBetaLimit = 0.1;
        camera.upperBetaLimit = Math.PI / 2;
        // Set limits for rotation left/right
        camera.upperAlphaLimit = 0;
        camera.lowerAlphaLimit = -Math.PI;

        // Disable keyboard controls
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        // camera.inputs.clear();
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

        return camera;
    }

    static async createGameObjects(babylon: BabylonObjects): Promise<{
        board: Mesh;
        paddle1: Mesh;
        paddle2: Mesh;
        ball: Mesh;
    }> {
        // const objectConfigs = (await (await getObjectConfigs()).json())
        //     .data as unknown as ObjectConfig;
        const objectConfigs = defaultGameConfig as unknown as ObjectConfig;

        // export type PongConfig = {
        //     board: { size: Size3D };
        //     paddles: [Paddle, Paddle];
        //     ball: Ball;
        //     playTo: number;
        //     fps: number;
        //     resetDelay: number;
        // };

        // export type PongState = {
        //     status: PongStatus;
        //     scores: [number, number];
        //     ball: Ball;
        //     paddles: [Paddle, Paddle];
        // };

        // Define consts
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
                width: objectConfigs.BOARD_WIDTH,
                height: objectConfigs.BOARD_DEPTH,
                subdivisions: 50,
                maxHeight: 0.3,
                minHeight: -0.2,
            },
            babylon.scene
        );

        board.position = positions.BOARD;
        board.material = boardMaterial;
        // board.material.wireframe = true;
        board.receiveShadows = true;

        const paddle1 = MeshBuilder.CreateSphere(
            "paddle1",
            {
                diameterX: 2 * objectConfigs.PADDLE_WIDTH,
                diameterY: objectConfigs.PADDLE_HEIGHT,
                diameterZ: objectConfigs.PADDLE_DEPTH,
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
                diameterX: 2 * objectConfigs.PADDLE_WIDTH,
                diameterY: objectConfigs.PADDLE_HEIGHT,
                diameterZ: objectConfigs.PADDLE_DEPTH,
            },
            babylon.scene
        );
        paddle2.position = positions.PADDLE2;
        paddle2.rotation.x = rotations.PADDLE2;
        paddleMaterial.diffuseColor = materials.PADDLE2.diffuseColor;
        paddle2.material = paddleMaterial2;

        // ----------------- Create ball
        const ballMaterial = new StandardMaterial("ball", babylon.scene);
        // ballMaterial.wireframe = true;

        const ball = MeshBuilder.CreateSphere(
            "ball",
            {
                diameter: objectConfigs.BALL_RADIUS * 2,
            },
            babylon.scene
        );
        ball.position = positions.BALL;
        ballMaterial.diffuseColor = materials.BALL.diffuseColor;
        ball.material = ballMaterial;

        const cushions: Mesh[] = [];
        const cushionMaterial = new StandardMaterial("cushion", babylon.scene);
        cushionMaterial.diffuseColor = new Color3(0.7, 0, 0); // Red color for visibility

        const cushionPositions = [
            new Vector3(0, 0.1, objectConfigs.BOARD_DEPTH / 2 + 0.5), // Top
            new Vector3(0, 0.1, -objectConfigs.BOARD_DEPTH / 2 - 0.5), // Bottom
            new Vector3(objectConfigs.BOARD_WIDTH / 2 + 0.5, 0.1, 0), // Right
            new Vector3(-objectConfigs.BOARD_WIDTH / 2 - 0.5, 0.1, 0), // Left
        ];

        cushionPositions.forEach((pos) => {
            const cushion = MeshBuilder.CreateBox(
                "cushion",
                {
                    width: pos.z === 0 ? 1 : objectConfigs.BOARD_WIDTH + 2,
                    height: 0.2,
                    depth: pos.z === 0 ? objectConfigs.BOARD_DEPTH + 2 : 1,
                },
                babylon.scene
            );

            cushion.position = pos;
            cushion.material = cushionMaterial;
            babylon.shadowGenerator.addShadowCaster(cushion);
            cushions.push(cushion);
        });

        return { board, paddle1, paddle2, ball };
    }

    // createScoreText(): Mesh {
    //     //
    // }
}
