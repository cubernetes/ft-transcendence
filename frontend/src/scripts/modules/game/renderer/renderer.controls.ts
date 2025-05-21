import { AudioEngineV2, Engine } from "@babylonjs/core";
import {
    AdvancedDynamicTexture,
    Button,
    Control,
    Grid,
    Slider,
    StackPanel,
    TextBlock,
} from "@babylonjs/gui";
import { getText } from "../../locale/locale.utils";
import { toggleShadows } from "./renderer.light";

// #region: Control components
/** Set the column and the row definition of the grid */
const scaleGrid = (grid: Grid) => {
    grid.addColumnDefinition(0.2);
    grid.addColumnDefinition(0.2);
    grid.addColumnDefinition(0.2);
    grid.addColumnDefinition(0.1);
    grid.addColumnDefinition(0.1);
    grid.addColumnDefinition(0.2);
    grid.addRowDefinition(0.07); // Control panel ratio
    grid.addRowDefinition(0.93); // Empty
};

/** Create the shadow toggle button */
const createShadowButton = (grid: Grid, engine: Engine) => {
    // Style the button
    const styleShadowButton = (button: Button) => {
        button.width = "100px";
        button.height = "35px";
        button.color = "white";
        button.cornerRadius = 20;
        button.background = engine.shadowsEnabled ? "blue" : "gray";
    };

    // Create shadow button and add it to grid
    const button = Button.CreateSimpleButton("shadowToggle", getText(CONST.TEXT.SHADOWS));
    styleShadowButton(button);
    button.onPointerUpObservable.add(() => {
        toggleShadows(engine);
        button.background = engine.shadowsEnabled ? "blue" : "gray";
    });
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

    button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
};

/** Create the SFX toggle button */
const createSFXButton = (grid: Grid, engine: Engine) => {
    const buttonSFX = Button.CreateSimpleButton("sfx", "SFX");
    styleSoundButton(buttonSFX);
    buttonSFX.background = engine.sfxEnabled ? "green" : "red";
    buttonSFX.onPointerUpObservable.add(() => {
        if (engine.sfxEnabled) {
            engine.sfxEnabled = false;
            localStorage.setItem(CONST.KEY.SFX, "0");
            buttonSFX.background = "red";
        } else {
            engine.sfxEnabled = true;
            localStorage.setItem(CONST.KEY.SFX, "1");
            buttonSFX.background = "green";
        }
    });
    grid.addControl(buttonSFX, 0, 3);
};

/** Create the music toggle button */
const createMusicButton = (grid: Grid, engine: Engine) => {
    const button = Button.CreateSimpleButton("bgMusic", getText(CONST.TEXT.MUSIC));
    styleSoundButton(button);
    button.background = engine.bgmEnabled ? "green" : "red";
    button.onPointerUpObservable.add(() => {
        if (engine.bgmEnabled) {
            engine.bgmEnabled = false;
            engine.audio.bgMusic.pause();
            localStorage.setItem(CONST.KEY.BGM, "0");
            button.background = "red";
        } else {
            engine.bgmEnabled = true;
            engine.audio.bgMusic.play();
            localStorage.setItem(CONST.KEY.BGM, "1");
            button.background = "green";
        }
    });
    grid.addControl(button, 0, 4);
};

/** Create volume slider */
const createVolumePanel = (grid: Grid, engine: AudioEngineV2) => {
    const panelVol = new StackPanel();
    panelVol.width = "220px";
    grid.addControl(panelVol, 0, 6);

    const header = new TextBlock();
    header.text = `${getText(CONST.TEXT.VOLUME)}: 50 %`;
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
        header.text = `${getText(CONST.TEXT.VOLUME)}: ` + (value | 0) + " %";
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
    createMusicButton(grid, engine);
    createVolumePanel(grid, engine.audio);

    return controls;
};
