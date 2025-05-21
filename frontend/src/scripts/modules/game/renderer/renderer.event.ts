import {
    ArcRotateCamera,
    Color3,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";
import { getText } from "../../locale/locale.utils";

export const showCountdown = async (scene: Scene, signal: AbortSignal): Promise<void> => {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("countdownUI", true, scene);

    const countdownText = Object.assign(new TextBlock(), {
        color: "white",
        fontSize: 96,
        textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
        verticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
    });

    advancedTexture.addControl(countdownText);

    const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

    for (let count = 3; count > 0; count--) {
        if (signal.aborted) return advancedTexture.dispose();

        countdownText.text = count.toString();
        await delay(1000);
    }

    advancedTexture.dispose();
};

export const showGameOver = (scene: Scene, winner: string): void => {
    const camera = scene.activeCamera! as ArcRotateCamera;

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
    gameOverText.text = getText(CONST.TEXT.GAME_OVER);
    gameOverText.color = "red";
    gameOverText.fontSize = 72;
    gameOverText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    gameOverText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Winner text
    const winnerText = new TextBlock();
    winnerText.text = `${getText(CONST.TEXT.WINNER)}: ${winner}`;
    winnerText.color = "white";
    winnerText.fontSize = 36;
    winnerText.top = "80px";
    winnerText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    winnerText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

    // Add to UI
    advancedTexture.addControl(gameOverText);
    advancedTexture.addControl(winnerText);
};
