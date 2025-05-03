import { Result, err, ok } from "neverthrow";
import { Engine, IFontData, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";

type ScoreConfig = {
    name: string;
    font: IFontData;
    options: {
        size: number;
        resolution: number;
        depth: number;
    };
};

const scoreConfig = async (): Promise<Result<ScoreConfig, Error>> => {
    // TODO: change this
    const font = await (await fetch(`${CONST.DIR.ASSET}/Montserrat_Regular.json`)).json();
    if (!font) {
        return err(new Error("Failed to load font data"));
    }

    return ok({
        name: "scorePrint",
        font: font,
        options: {
            size: 2,
            resolution: 8,
            depth: 1,
        },
    });
};

export const createScore = async (engine: Engine, scores: [number, number], pos: Vector3) => {
    const { scene } = engine;
    const config = await scoreConfig();

    if (config.isErr()) {
        return log.error(config.error.message);
    }

    const { name, font, options } = config.value;

    const scorePrint = MeshBuilder.CreateText(
        name,
        `${scores[0]} : ${scores[1]}`,
        font,
        options,
        scene
    );

    if (!scorePrint) {
        return log.error("Score print failed");
    }

    scorePrint.position = pos;

    // TODO: Change this
    if (engine.score) {
        engine.score.dispose();
        // engine.score = null;
    }
    engine.score = scorePrint;
};
