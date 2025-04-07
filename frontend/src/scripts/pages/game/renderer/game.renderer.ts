import {
    Animation,
    ArcRotateCamera,
    Axis,
    BackgroundMaterial,
    Color3,
    CreateAudioEngineAsync,
    CreateSoundAsync,
    CreateStreamingSoundAsync,
    CubeTexture,
    DirectionalLight,
    GlowLayer,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    PBRMaterial,
    Quaternion,
    Scene,
    ShadowGenerator,
    SoundState,
    Space,
    StandardMaterial,
    Texture,
    TrailMesh,
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
import { ASSETS_DIR } from "../../../config";
import { gameConfig } from "../game.config";
import { BabylonObjects } from "../game.types";

export class SceneSetup {
    static createScene(babylon: BabylonObjects): void {
        // --------- SCENE
        const scene = new Scene(babylon.engine);
        scene.audioEnabled = true;
        // scene.environmentIntensity = 0.5;
        const glow = new GlowLayer("glow", scene);
        glow.intensity = 5;
        babylon.scene = scene;

        // --------- LIGHT
        const light = new DirectionalLight("directionalLight", new Vector3(0, -4, 0), scene);
        babylon.light = light;
        light.intensity = 1.0;
        light.shadowMinZ = 3.5;
        light.shadowMaxZ = 15;
        light.shadowEnabled;
        // light.autoUpdateExtends = false;
        // light.autoCalcShadowZBounds = true;

        const hemiLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
        hemiLight.intensity = 0.5;

        // --------- SHADOWS
        const shadowGenerator = new ShadowGenerator(1024, light);
        babylon.shadowGenerator = shadowGenerator;
        shadowGenerator.setDarkness(0.2);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.useKernelBlur = true;
        shadowGenerator.blurKernel = 6;

        // --------- CONTROLS
        var controls = AdvancedDynamicTexture.CreateFullscreenUI("UI");
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
                // babylon.shadowGenerator.getShadowMap().renderList = [babylon.paddle1, babylon.paddle2, babylon.ball];
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
        // slider2.blur;
        slider2.onValueChangedObservable.add(function (value) {
            header.text = "Volume: " + (value | 0) + " %";
            babylon.audioEngine.volume = value / 100;
        });
        panelVol.addControl(slider2);
    }

    static setupScene(scene: Scene): void {
        // ---------------- SKYBOX
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
        // scene.environmentTexture = sky.reflectionTexture;
        sky.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

        const skydome = MeshBuilder.CreateBox(
            "sky",
            {
                size: 1000,
                sideOrientation: Mesh.BACKSIDE,
            },
            scene
        );
        // skydome.infiniteDistance = true;
        skydome.material = sky;
        skydome.rotate(Axis.Y, Math.PI, Space.LOCAL);
    }

    static async createAudio(babylon: BabylonObjects): Promise<void> {
        const audioEngine = await CreateAudioEngineAsync();
        await audioEngine.unlockAsync();
        babylon.audioEngine = audioEngine;

        // -------------- BACKGROUND MUSIC
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

        // -------------- SOUNDS
        const hitSound = await CreateSoundAsync(
            "hitSound",
            `${ASSETS_DIR}/audio/hit.mp3`,
            {
                maxInstances: 2,
                volume: 0.8,
                spatialEnabled: true,
            },
            audioEngine
        );
        babylon.hitSound = hitSound;

        const bounceSound = await CreateSoundAsync(
            "bounceSound",
            `${ASSETS_DIR}/audio/bounce.mp3`,
            {
                maxInstances: 2,
                volume: 0.8,
                spatialEnabled: true,
            },
            audioEngine
        );
        babylon.bounceSound = bounceSound;

        const blopSound = await CreateSoundAsync(
            "blopSound",
            `${ASSETS_DIR}/audio/blop.mp3`,
            {
                maxInstances: 2,
                pitch: 1.5,
                spatialEnabled: true,
            },
            audioEngine
        );
        babylon.blopSound = blopSound;

        const ballSound = await CreateSoundAsync(
            "ballSound",
            `${ASSETS_DIR}/audio/tatata.mp3`,
            {
                maxInstances: 2,
                playbackRate: 1.5,
                spatialEnabled: true,
            },
            audioEngine
        );
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
        var radAnim = new Animation("animCam", "radius", 15, Animation.ANIMATIONTYPE_FLOAT);
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
        var alphaAnim = new Animation("animCam", "alpha", 15, Animation.ANIMATIONTYPE_FLOAT);
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

    static createBallMaterial(babylon: BabylonObjects): PBRMaterial {
        //Note the textures for this method are not included in the code

        const pbr = new PBRMaterial("ballMat", babylon.scene);
        // pbr.environmentIntensity = 0.25;

        pbr.albedoColor = new Color3(1, 0.2, 0.6);
        pbr.albedoTexture = new Texture(
            `${ASSETS_DIR}/textures/red_ground/cracked_red_ground_diff_1k.jpg`,
            babylon.scene
        );

        pbr.metallic = 0.2;
        pbr.roughness = 0.5;

        pbr.bumpTexture = new Texture(
            `${ASSETS_DIR}/textures/red_ground/cracked_red_ground_nor_dx_1k.jpg`,
            babylon.scene
        );
        pbr.bumpTexture.level = 20;

        return pbr;
    }

    static async createGameObjects(babylon: BabylonObjects): Promise<void> {
        const defObj = defaultGameConfig; // as given from the PONG engine

        // Define consts -
        const positions = gameConfig.positions;
        const rotations = gameConfig.rotations;
        const materials = gameConfig.materials;

        // --------------- Create GROUND
        const middleLine = MeshBuilder.CreateBox(
            "middleLine",
            {
                width: 0.1,
                height: defObj.board.size.depth,
                depth: 0.1,
            },
            babylon.scene
        );
        middleLine.rotation.x = Math.PI / 2;
        middleLine.position = new Vector3(0, -0.5, 0);
        const middleLineMaterial = new StandardMaterial("middleLine", babylon.scene);
        middleLineMaterial.diffuseColor = new Color3(1, 1, 1);
        middleLineMaterial.specularColor = new Color3(1, 0, 0);
        middleLine.material = middleLineMaterial;
        middleLine.receiveShadows = true;

        const board = MeshBuilder.CreateGround(
            "board",
            {
                width: defObj.board.size.width,
                height: defObj.board.size.depth,
                subdivisions: 4,
            },
            babylon.scene
        );
        board.position.y = -0.5;
        const boardMaterial = new StandardMaterial("board", babylon.scene);

        boardMaterial.diffuseTexture = new Texture(
            `${ASSETS_DIR}/textures/tiles/rubber_tiles_nor_gl_1k.jpg`,
            babylon.scene
        );
        boardMaterial.diffuseColor = new Color3(0.8, 1, 0.8);
        var texture = boardMaterial.diffuseTexture as Texture;
        texture.uScale = 4;
        texture.vScale = 3;

        boardMaterial.specularTexture = new Texture(
            `${ASSETS_DIR}/textures/tiles/rubber_tiles_diff_1k.jpg`,
            babylon.scene
        );
        boardMaterial.specularColor = new Color3(0.5, 0.2, 0);

        boardMaterial.bumpTexture = new Texture(
            `${ASSETS_DIR}/textures/tiles/rubber_tiles_rough_1k.jpg`,
            babylon.scene
        );
        boardMaterial.roughness = 50;

        babylon.board = board;
        board.position = positions.BOARD;
        board.material = boardMaterial;
        board.receiveShadows = true;

        // --------------- Create SCORE
        var fontData = await (await fetch(`${ASSETS_DIR}/Montserrat_Regular.json`)).json();
        if (!fontData) {
            throw new Error("Failed to load font data");
        }
        babylon.fontData = fontData;
        this.createScore([0, 0], babylon);

        // ----------------- Create PADDLES
        const paddleMaterial = new StandardMaterial("paddleMat", babylon.scene);
        const paddleMaterial2 = new StandardMaterial("paddleMat2", babylon.scene);
        paddleMaterial2.diffuseColor = new Color3(0, 0.5, 0);
        paddleMaterial2.specularPower = 64;
        paddleMaterial2.emissiveColor = new Color3(0, 0, 1);
        paddleMaterial2.backFaceCulling = false;

        const paddleMaterial3 = new StandardMaterial("paddleMat3", babylon.scene);
        paddleMaterial3.diffuseColor = new Color3(0.2, 0.7, 1);
        paddleMaterial3.specularPower = 64;
        paddleMaterial3.emissiveColor = new Color3(0.1, 0.3, 1);
        paddleMaterial3.backFaceCulling = false;
        paddleMaterial3.alphaMode = 1;

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
        const ball = MeshBuilder.CreateSphere(
            "ball",
            {
                diameter: defObj.ball.r * 2,
            },
            babylon.scene
        );
        ball.position = positions.BALL;
        ball.rotationQuaternion = Quaternion.Identity();
        babylon.ballMat = SceneSetup.createBallMaterial(babylon);
        ball.material = babylon.ballMat;

        babylon.hitSound.spatial.attach(ball);
        babylon.bounceSound.spatial.attach(ball);
        babylon.blopSound.spatial.attach(ball);
        babylon.ballSound.spatial.attach(ball);

        // ------------------- BALL TRAIL
        const trail = new TrailMesh("ballTrail", ball, babylon.scene, defObj.ball.r, 30);
        const trailMaterial = new StandardMaterial("trailMat", babylon.scene);
        trailMaterial.diffuseColor = materials.BALL.diffuseColor;
        trailMaterial.alpha = 0.5;
        trail.material = trailMaterial;

        // ----------------- Create WALLS
        const cushions: Mesh[] = [];
        const cushionMaterial = new StandardMaterial("cushion", babylon.scene);
        cushionMaterial.diffuseColor = new Color3(0.6, 0, 0); // Red color for visibility

        const cushionPositions = [
            new Vector3(0, -0.1, defObj.board.size.depth / 2 + 0.5), // Top
            new Vector3(0, -0.1, -defObj.board.size.depth / 2 - 0.5), // Bottom
            new Vector3(defObj.board.size.width / 2 + 0.5, -0.1, 0), // Right
            new Vector3(-defObj.board.size.width / 2 - 0.5, -0.1, 0), // Left
        ];
        cushionPositions.forEach((pos) => {
            const cushion = MeshBuilder.CreateBox(
                "cushion",
                {
                    width: pos.z === 0 ? 1 : defObj.board.size.width + 2,
                    height: 0.5,
                    depth: pos.z === 0 ? defObj.board.size.depth + 2 : 1,
                },
                babylon.scene
            );

            cushion.position = pos;
            cushion.material = cushionMaterial;
            cushions.push(cushion);
        });

        babylon.board = board;
        babylon.paddle1 = paddle1;
        babylon.paddle2 = paddle2;
        babylon.ball = ball;
    }

    static showGameOver(babylon: BabylonObjects, winner: string): void {
        const { scene, camera } = babylon;

        // Create full-screen fade plane
        const fadePlane = MeshBuilder.CreatePlane("fade", { size: 100 }, scene);
        fadePlane.position.z = camera.radius - 1;

        const fadeMaterial = new StandardMaterial("fadeMat", scene);
        fadeMaterial.diffuseColor = new Color3(0, 0, 0);
        fadeMaterial.alpha = 0;
        fadePlane.material = fadeMaterial;

        // Optional: make fade plane always face camera
        fadePlane.billboardMode = Mesh.BILLBOARDMODE_ALL;

        // Animation state
        let fadeDone = false;

        scene.onBeforeRenderObservable.add(() => {
            if (!fadeDone) {
                fadeMaterial.alpha = Math.min(1, fadeMaterial.alpha + 0.01);
                if (fadeMaterial.alpha >= 1) {
                    fadeDone = true;
                }
            }
        });

        // Create full-screen UI layer
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("gameOverUI");

        // GAME OVER text
        const gameOverText = new TextBlock();
        gameOverText.text = "GAME OVER";
        gameOverText.color = "red";
        gameOverText.fontSize = 72;
        gameOverText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        gameOverText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        // Winner text
        const winnerText = new TextBlock();
        winnerText.text = `Winner: ${winner}`;
        winnerText.color = "white";
        winnerText.fontSize = 36;
        winnerText.top = "80px";
        winnerText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        winnerText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        // Add to UI
        advancedTexture.addControl(gameOverText);
        advancedTexture.addControl(winnerText);
    }

    static shakeCamera(babylon: BabylonObjects): void {
        if (!babylon.camera.animations) {
            babylon.camera.animations = []; // Initialize
        }

        let shakeAnim = babylon.camera.animations.find((anim) => anim.name === "shake");

        if (!shakeAnim) {
            shakeAnim = new Animation(
                "shake",
                "position",
                60,
                Animation.ANIMATIONTYPE_VECTOR3,
                Animation.ANIMATIONLOOPMODE_CYCLE
            );
            // shakeAnim.enableBlending = true;
            babylon.camera.animations.push(shakeAnim);
        }
        const start = babylon.camera.position.clone();
        const keys = [];

        for (let i = 0; i <= 5; i++) {
            keys.push({
                frame: i * 2,
                value: start.addInPlace(
                    new Vector3(
                        (Math.random() - 0.5) * 0.3,
                        (Math.random() - 0.5) * 0.3,
                        (Math.random() - 0.5) * 0.3
                    )
                ),
            });
        }
        keys.push({ frame: 12, value: start });

        shakeAnim.setKeys(keys);

        babylon.scene.beginAnimation(babylon.camera, 0, 12, false, 3);
    }

    static pulseLight(babylon: BabylonObjects): void {
        if (!babylon.light.animations) {
            babylon.light.animations = []; // Initialize if null
        }
        let anim = babylon.light.animations.find((anim) => anim.name === "lightPulse");

        if (!anim) {
            const flashAnim = new Animation(
                "lightPulse",
                "intensity",
                60,
                Animation.ANIMATIONTYPE_FLOAT,
                Animation.ANIMATIONLOOPMODE_CONSTANT
            );

            flashAnim.setKeys([
                { frame: 0, value: babylon.light.intensity },
                { frame: 5, value: 5 },
                { frame: 10, value: babylon.light.intensity },
                { frame: 15, value: 10 },
                { frame: 20, value: babylon.light.intensity },
            ]);
            babylon.light.animations.push(flashAnim);
        }

        babylon.scene.beginAnimation(babylon.light, 0, 20, false);
    }

    static pulseBall(babylon: BabylonObjects): void {
        if (!babylon.ballMat.animations) {
            babylon.ballMat.animations = []; // Initialize if null or undefined
        }
        let anim = babylon.ballMat.animations.find((anim) => anim.name === "glow");

        if (!anim) {
            anim = new Animation("glow", "emissiveColor", 60, Animation.ANIMATIONTYPE_COLOR3);

            anim.setKeys([
                { frame: 0, value: Color3.Black() },
                { frame: 3, value: new Color3(0, 0.7, 0.5) },
                { frame: 6, value: new Color3(0.7, 0, 0.5) },
                { frame: 10, value: Color3.Black() },
            ]);

            babylon.ballMat.animations.push(anim);
        }

        babylon.scene.beginAnimation(babylon.ballMat, 0, 10, false);
    }
}
