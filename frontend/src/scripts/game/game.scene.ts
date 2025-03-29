import {
    Mesh,
    Scene,
    StandardMaterial,
    Texture,
    MeshBuilder,
    ArcRotateCamera,
    Vector3,
    Color3,
    CreateAudioEngineAsync,
    CreateStreamingSoundAsync,
    StaticSound,
    StreamingSound,
    AudioEngineV2,
    DynamicTexture,
    CreateSoundAsync,
    Color4,
    CreateText,
    HemisphericLight,
    Tools,
    SoundState,
} from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Control,
    StackPanel,
    Button,
    TextBlock,
    Slider,
    ImageBasedSlider,
    Image,
    Grid,
} from "@babylonjs/gui";
import { getObjectConfigs, gameConfig, ObjectConfig } from "./game.config";
import { ASSETS_DIR } from "../config";

export class SceneSetup {
    static createScene(engine: any): { scene: Scene; controls: AdvancedDynamicTexture } {
        const scene = new Scene(engine);
        scene.audioEnabled = true;
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // GUI
        var controls = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        return { scene, controls };
    }

    static createControls(controls: AdvancedDynamicTexture, bgMusic: StreamingSound): void {
        // Create a grid
        var grid = new Grid();
        controls.addControl(grid);

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

        // // Create a button
        var button1 = Button.CreateSimpleButton("but1", "Click Me");
        button1.width = "150px";
        button1.height = "40px";
        button1.color = "white";
        button1.cornerRadius = 20;
        button1.background = "green";
        button1.onPointerUpObservable.add(function () {
            alert("You just clicked a button!");
            // controls.rootContainer.fontSize = "9px";
            //button1.children[0].fontSize = "9px";
        });
        controls.addControl(button1);

        // Create a button for the game music
        var buttonMusic = Button.CreateSimpleButton("bgMusic", "Mute\nMusic");
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
            if (bgMusic.state === SoundState.Started) {
                bgMusic.pause();
                buttonMusic.background = "red";
                buttonMusic.textBlock!.text = "Play\nMusic";
            } else {
                bgMusic.play();
                buttonMusic.background = "green";
                buttonMusic.textBlock!.text = "Mute\nMusic";
            }
        });
        grid.addControl(buttonMusic, 0, 4);

        // Create a volume-slider
        var panelVol = new StackPanel();
        panelVol.width = "220px";
        grid.addControl(panelVol, 0, 5);

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
            bgMusic.volume = value / 100;
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
        // Disable keyboard controls
        camera.inputs.removeByType("ArcRotateCameraKeyboardMoveInput");
        // camera.inputs.clear();
        camera.attachControl(scene.getEngine().getRenderingCanvas(), true);

        return camera;
    }

    static async createGameObjects(scene: Scene): Promise<{
        board: Mesh;
        paddle1: Mesh;
        paddle2: Mesh;
        ball: Mesh;
    }> {
        const objectConfigs = (await (await getObjectConfigs()).json())
            .data as unknown as ObjectConfig;

        // Define consts
        const positions = gameConfig.positions;
        const rotations = gameConfig.rotations;
        const materials = gameConfig.materials;
        const boardMaterial = new StandardMaterial("board", scene);
        const paddleMaterial = new StandardMaterial("paddle", scene);
        const ballMaterial = new StandardMaterial("ball", scene);

        // Create game board
        const board = MeshBuilder.CreateBox(
            "board",
            {
                width: objectConfigs.BOARD_WIDTH,
                height: objectConfigs.BOARD_HEIGHT,
                depth: objectConfigs.BOARD_DEPTH,
            },
            scene
        );
        board.position = positions.BOARD;
        boardMaterial.diffuseColor = materials.BOARD.diffuseColor;
        boardMaterial.specularColor = materials.BOARD.specularColor;
        board.material = boardMaterial;

        const paddle1 = MeshBuilder.CreateSphere(
            "paddle1",
            {
                width: objectConfigs.PADDLE_WIDTH,
                height: objectConfigs.PADDLE_HEIGHT,
                depth: objectConfigs.PADDLE_DEPTH,
            },
            scene
        );
        paddle1.position = positions.PADDLE1;
        paddle1.rotation.x = rotations.PADDLE1;
        paddleMaterial.diffuseColor = materials.PADDLE1.diffuseColor;
        paddle1.material = paddleMaterial;

        const paddle2 = MeshBuilder.CreateBox(
            "paddle2",
            {
                width: objectConfigs.PADDLE_WIDTH,
                height: objectConfigs.PADDLE_HEIGHT,
                depth: objectConfigs.PADDLE_DEPTH,
            },
            scene
        );
        paddle2.position = positions.PADDLE2;
        paddle2.rotation.x = rotations.PADDLE2;
        paddleMaterial.diffuseColor = materials.PADDLE2.diffuseColor;
        paddle2.material = paddleMaterial;

        // Create ball
        const ball = MeshBuilder.CreateSphere(
            "ball",
            {
                diameter: objectConfigs.BALL_RADIUS * 2,
            },
            scene
        );
        ball.position = positions.BALL;
        ballMaterial.diffuseColor = materials.BALL.diffuseColor;
        ball.material = ballMaterial;

        return { board, paddle1, paddle2, ball };
    }

    // createScoreText(): Mesh {
    //     //
    // }
}
