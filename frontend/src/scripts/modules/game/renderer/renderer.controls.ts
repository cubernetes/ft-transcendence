import { type AbstractMesh, AudioEngineV2, ShadowGenerator, SoundState } from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Grid,
    Slider,
    StackPanel,
    TextBlock,
} from "@babylonjs/gui";

/** Set the column and the row definition of the grid */
const scaleGrid = (grid: Grid) => {
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
};

/** Create the shadow toggle button */
const createShadowButton = (
    grid: Grid,
    generator: ShadowGenerator,
    objs: AbstractMesh[],
    state: ControlState
) => {
    // Style the button
    const styleShadowButton = (button: Button) => {
        button.width = "100px";
        button.height = "35px";
        button.color = "white";
        button.cornerRadius = 20;
        button.background = "gray";
    };

    // Callback for the button
    const buttonHandler = (
        button: Button,
        generator: ShadowGenerator,
        objs: AbstractMesh[],
        { shadowsEnabled }: ControlState
    ) => {
        if (shadowsEnabled) {
            shadowsEnabled = false;
            generator.getShadowMap()?.renderList?.splice(0);
            //button.textBlock!.text = "Shadows";
            button.background = "gray";
        } else {
            shadowsEnabled = true;
            objs.forEach((obj) => generator.addShadowCaster(obj));
            // shadowGenerator.addShadowCaster(babylon.paddle1);
            // shadowGenerator.addShadowCaster(babylon.paddle2);
            // shadowGenerator.addShadowCaster(babylon.ball);
            //shadowButton.textBlock!.text = "Shadows";
            button.background = "blue";
        }
    };

    // Create shadow button and add it to grid
    const button = Button.CreateSimpleButton("shadowToggle", "Shadows");
    styleShadowButton(button);
    button.onPointerUpObservable.add(() => buttonHandler(button, generator, objs, state));
    grid.addControl(button, 0, 2);
};

/** Style the SFX and music button */
const styleSoundButton = (button: Button) => {
    button.fontSize = 15;
    button.fontFamily = "Cambria";
    button.fontStyle = "italic";
    button.height = "35px";
    button.width = "60px";
    button.color = "white";
    button.cornerRadius = 20;
    button.background = "green";

    button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
};

const createSFXButton = (grid: Grid, { soundsEnabled }: ControlState) => {
    const buttonSFX = Button.CreateSimpleButton("sfx", "SFX");
    styleSoundButton(buttonSFX);
    buttonSFX.onPointerUpObservable.add(() => {
        if (soundsEnabled) {
            soundsEnabled = false;
            buttonSFX.background = "red";
        } else {
            soundsEnabled = true;
            buttonSFX.background = "green";
        }
    });
    grid.addControl(buttonSFX, 0, 3);
};

const createMusicButton = (grid: Grid, audio: AudioEngineV2) => {
    const buttonHandler = (button: Button, audio: AudioEngineV2) => {
        if (!audio.bgMusic) {
            return window.log.error("Background music not attached on engine");
        }

        const { bgMusic } = audio;
        if (bgMusic.state === SoundState.Started) {
            bgMusic.pause();
            button.background = "red";
        } else {
            bgMusic.play();
            button.background = "green";
        }
    };

    const button = Button.CreateSimpleButton("bgMusic", "Music");
    styleSoundButton(button);
    button.onPointerUpObservable.add(() => buttonHandler(button, audio));
    grid.addControl(button, 0, 4);
};

type ControlState = {
    shadowsEnabled: boolean;
    soundsEnabled: boolean;
};

export const createControls = (
    shadowGenerator: ShadowGenerator,
    audio: AudioEngineV2,
    objs: AbstractMesh[]
) => {
    // Default state
    const state = {
        shadowsEnabled: false,
        soundsEnabled: false,
    };

    const controls = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const grid = new Grid();
    controls.addControl(grid);
    scaleGrid(grid);

    // Create control elements
    createShadowButton(grid, shadowGenerator, objs, state);
    createSFXButton(grid, state);
    createMusicButton(grid, audio);

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

    return controls;
};
