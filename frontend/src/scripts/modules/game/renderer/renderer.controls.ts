import { AudioEngineV2, Engine, SoundState } from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Grid,
    Slider,
    StackPanel,
    TextBlock,
} from "@babylonjs/gui";

// #region: Control components
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
const createShadowButton = (grid: Grid, engine: Engine) => {
    // Style the button
    const styleShadowButton = (button: Button) => {
        button.width = "100px";
        button.height = "35px";
        button.color = "white";
        button.cornerRadius = 20;
        button.background = "gray";
    };

    // Callback for the button
    const buttonHandler = (button: Button, engine: Engine) => {
        if (engine.shadowsEnabled) {
            engine.shadowsEnabled = false;
            engine.shadowGenerator.getShadowMap()?.renderList?.splice(0);
            //button.textBlock!.text = "Shadows";
            button.background = "gray";
        } else {
            engine.shadowsEnabled = true;
            engine.shadowGenerator.addShadowCaster(engine.leftPaddle);
            engine.shadowGenerator.addShadowCaster(engine.rightPaddle);
            engine.shadowGenerator.addShadowCaster(engine.ball);
            //shadowButton.textBlock!.text = "Shadows";
            button.background = "blue";
        }
    };

    // Create shadow button and add it to grid
    const button = Button.CreateSimpleButton("shadowToggle", "Shadows");
    styleShadowButton(button);
    button.onPointerUpObservable.add(() => buttonHandler(button, engine));
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

/** Create the SFX toggle button */
const createSFXButton = (grid: Grid, engine: Engine) => {
    const buttonSFX = Button.CreateSimpleButton("sfx", "SFX");
    styleSoundButton(buttonSFX);
    buttonSFX.onPointerUpObservable.add(() => {
        if (engine.soundsEnabled) {
            engine.soundsEnabled = false;
            buttonSFX.background = "red";
        } else {
            engine.soundsEnabled = true;
            buttonSFX.background = "green";
        }
    });
    grid.addControl(buttonSFX, 0, 3);
};

/** Create the music toggle button */
const createMusicButton = (grid: Grid, audio: AudioEngineV2) => {
    const buttonHandler = (button: Button, audio: AudioEngineV2) => {
        if (!audio.bgMusic) {
            return log.error("Background music not attached on engine");
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

/** Create volume slider */
const createVolumePanel = (grid: Grid, engine: AudioEngineV2) => {
    const panelVol = new StackPanel();
    panelVol.width = "220px";
    grid.addControl(panelVol, 0, 6);

    const header = new TextBlock();
    header.text = "Volume: 50 %";
    header.fontSize = 16;
    header.fontStyle = "italic";
    header.fontFamily = "Calibri";
    header.height = "15px";
    header.color = "white";
    panelVol.addControl(header);

    const slider2 = new Slider();
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
        engine.volume = value / 100;
    });
    panelVol.addControl(slider2);
    return panelVol;
};

// #endregion

export const createControls = (engine: Engine): AdvancedDynamicTexture => {
    const controls = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const grid = new Grid();
    controls.addControl(grid);
    scaleGrid(grid);

    // Create control elements
    createShadowButton(grid, engine);
    createSFXButton(grid, engine);
    createMusicButton(grid, engine.audio);
    createVolumePanel(grid, engine.audio);

    return controls;
};
