import { Vec2D, ICLIGameState, GameConfig, FieldConfig } from "./game.types";

let GAME_CONFIG: GameConfig | null = null;
let FIELD_CONFIG: FieldConfig | null = null;
// Set terminal dimensions
let TERM_WIDTH = 160;
let TERM_HEIGHT = 40;

export function setGameConfig(config: GameConfig) {
    GAME_CONFIG = config;
    FIELD_CONFIG = {
        scaleX: TERM_WIDTH / config.BOARD_WIDTH,
        scaleY: TERM_HEIGHT / config.BOARD_DEPTH,
        paddleHeight: (config.PADDLE_DEPTH * TERM_HEIGHT) / config.BOARD_DEPTH,
    };
}

export function renderGameState(state: ICLIGameState) {
    if (!GAME_CONFIG || !FIELD_CONFIG) {
        throw new Error("Game config not set. Call setGameConfig() before rendering.");
    }
    const { ball, paddle1, paddle2, score } = state;
    const config = GAME_CONFIG;
    const { scaleX, scaleY, paddleHeight } = FIELD_CONFIG;

    // Project world coordinates to terminal grid
    const project = (v: Vec2D): { x: number; y: number } => ({
        x: Math.round(v.x * scaleX + TERM_WIDTH / 2 - 0.5),
        y: Math.round(v.y * scaleY + TERM_HEIGHT / 2 - 0.5),
    });

    const ballPos = project(ball);
    // const pad1Y = paddle1.y - config.PADDLE_DEPTH / 2;
    // const pad2Y = paddle2.y - config.PADDLE_DEPTH / 2;
    // const pad1Pos = project({ x: paddle1.x, y: pad1Y });
    // const pad2Pos = project({ x: paddle2.x, y: pad2Y });

    // Empty field
    const field: string[][] = Array.from({ length: TERM_HEIGHT }, () =>
        Array.from({ length: TERM_WIDTH }, () => " ")
    );

    const pad1YMin = (paddle1.y - config.PADDLE_DEPTH / 2) * scaleY + TERM_HEIGHT / 2;
    const pad1YMax = (paddle1.y + config.PADDLE_DEPTH / 2) * scaleY + TERM_HEIGHT / 2;
    const pad1begin = pad1YMin - Math.floor(pad1YMin);
    const pad1end = pad1YMax - Math.floor(pad1YMax);
    // Draw paddle 1
    if (pad1begin < 0.25) {
        field[Math.floor(pad1YMin)][1] = "█";
    } else if (pad1begin < 0.75) {
        field[Math.floor(pad1YMin)][1] = "▄";
    }
    for (let i = Math.ceil(pad1YMin); i < Math.floor(pad1YMax - 1); i++) {
        field[i][1] = "█";
    }
    if (pad1end >= 0.25 && pad1end < 0.75) {
        field[Math.floor(pad1YMax) - 1][1] = "▀";
    } else if (pad1end >= 0.75) {
        field[Math.floor(pad1YMax) - 1][1] = "█";
    }

    // Draw ball
    field[ballPos.y][ballPos.x] = "◯";

    // Clear and print
    console.clear();
    console.log(`Score: Player 1 - ${score.player1} : ${score.player2} - Player 2`);

    const border = "+" + "-".repeat(TERM_WIDTH) + "+";
    console.log(border);
    for (const row of field) {
        console.log("|" + row.join("") + "|");
    }
    console.log(border);
}

// Characters to use ╭ ╮ ╰╯ ◯◯
// █ ▄ ▀
// ▖ ▗ ▘ ▝
