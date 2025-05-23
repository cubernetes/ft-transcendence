import { Result, err, ok } from "neverthrow";
import { Engine, IFontData, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { PongConfig } from "@darrenkuro/pong-core";

const loadFont = async (url: string): Promise<Result<IFontData, string>> => {
    try {
        const res = await fetch(url);
        if (!res.ok) return err("Fail to load font");

        const json = await res.json();
        if (!json.glyphs) return err("Missing glyphs in font data");

        return ok(json as IFontData);
    } catch (error) {
        return err("Fail to load font");
    }
};

const printScore = async (scene: Scene, scores: [number, number], pos: Vector3) => {
    const tryLoadFont = await loadFont(`${CONST.DIR.FONTS}/Montserrat_Regular.json`);
    if (tryLoadFont.isErr()) return log.error(tryLoadFont.error);

    const print = `${scores[0]} : ${scores[1]}`;
    const font = tryLoadFont.value;
    const options = {
        size: 2,
        resolution: 8,
        depth: 1,
    };
    const score = MeshBuilder.CreateText(CONST.NAME.SCORE, print, font, options, scene);
    if (!score) return log.error("Fail to print score: Meshbuilder");

    score.position = pos;
};

export const createScore = async (scene: Scene, config: PongConfig) => {
    const pos = new Vector3(0, 1, config.board.size.depth / 2 + 0.5);
    printScore(scene, [0, 0], pos);
};

export const updateScore = async (scene: Scene, scores: [number, number]) => {
    const oldScore = scene.getMeshByName(CONST.NAME.SCORE)!;
    const pos = oldScore.position.clone();
    oldScore.dispose();
    printScore(scene, scores, pos);
};
