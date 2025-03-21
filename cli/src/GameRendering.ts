import { Vec2D, ICLIGameState, GameConfig, FieldConfig } from "./game.types";

let TERM_WIDTH = 160;
let TERM_HEIGHT = 40;
let GAME_CONFIG: GameConfig | null = null;
let FIELD_CONFIG: FieldConfig | null = null;
let FIELD_BUFFER: string[][] | null = null;
const BALL_TRAIL_LENGTH = 5;
let ballTrail: Vec2D[] = [];
let renderTick = 0;
let tickStyle = 0;

const CORNER_STYLES = [
    { tl: "╭", tr: "╮", bl: "╰", br: "╯" },
    { tl: "┌", tr: "┐", bl: "└", br: "┘" },
    { tl: "◤", tr: "◥", bl: "◣", br: "◢" },
];
const RESET = "\x1b[0m";
const FG_RED = "\x1b[31m";
const FG_GREEN = "\x1b[32m";
const FG_BLUE = "\x1b[34m";
const FG_CYAN = "\x1b[36m";
const FG_YELLOW = "\x1b[33m";
const FG_WHITE = "\x1b[37m";
const BG_BLACK = "\x1b[40m";

function color(text: string, fg: string = "", bg: string = ""): string {
    return `${fg}${bg}${text}${RESET}`;
}

function initFieldBuffer() {
    FIELD_BUFFER = Array.from({ length: TERM_HEIGHT }, () => Array(TERM_WIDTH).fill(" "));
}

export function setGameConfig(config: GameConfig) {
    GAME_CONFIG = config;
    FIELD_CONFIG = {
        scaleX: TERM_WIDTH / config.BOARD_WIDTH,
        scaleY: TERM_HEIGHT / config.BOARD_DEPTH,
        paddleHeight: (config.PADDLE_DEPTH * TERM_HEIGHT) / config.BOARD_DEPTH,
    };
    initFieldBuffer();
}

function drawPaddle(field: string[][], padYMin: number, padLen: number, padX: number): void {
    const yBeginFrac = padYMin - Math.floor(padYMin);
    const yEndFrac = padYMin + padLen - Math.floor(padYMin + padLen);

    const rowTop = Math.floor(padYMin);
    const rowBottom = Math.floor(padYMin + padLen) - 1;

    // Top cap
    if (rowTop >= 0 && rowTop < field.length) {
        if (yBeginFrac < 0.25) {
            field[rowTop][padX] = "█";
        } else if (yBeginFrac < 0.75) {
            field[rowTop][padX] = "▄";
        }
    }
    // Full body
    const yStart = Math.ceil(padYMin);
    const yEnd = Math.floor(padYMin + padLen - 1);
    for (let y = yStart; y <= yEnd; y++) {
        if (y >= 0 && y < field.length) {
            field[y][padX] = "█";
        }
    }
    // Bottom cap
    if (rowBottom >= 0 && rowBottom < field.length) {
        if (yEndFrac >= 0.25 && yEndFrac < 0.75) {
            field[rowBottom][padX] = "▀";
        } else if (yEndFrac >= 0.75) {
            field[rowBottom][padX] = "█";
        }
    }
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

function clearField() {
    FIELD_BUFFER?.forEach((row) => row.fill(" "));
}

const makeChar = (index: number) => {
    const brightness = [FG_WHITE, FG_CYAN, FG_BLUE, FG_GREEN, FG_RED];
    const char = [".", "•", "●", "◉", "◯"];
    return color(char[Math.min(index, char.length - 1)], brightness[index]);
};

// Draw ball with clamping handled in a utility function for reusability
function drawBall(field: string[][], ballPos: Vec2D): void {
    for (let i = 0; i < ballTrail.length; i++) {
        const pos = ballTrail[i];
        const ballX = clamp(
            Math.round(pos.x * FIELD_CONFIG!.scaleX + TERM_WIDTH / 2 - 1),
            0,
            TERM_WIDTH - 1
        );
        const ballY = clamp(
            Math.round(pos.y * FIELD_CONFIG!.scaleY + TERM_HEIGHT / 2 - 1),
            0,
            TERM_HEIGHT - 1
        );
        field[ballY][ballX] = makeChar(i);
    }
}

export function renderGameState(state: ICLIGameState) {
    if (!GAME_CONFIG || !FIELD_CONFIG || !FIELD_BUFFER) {
        throw new Error("Game config not set. Call setGameConfig() before rendering.");
    }
    const { ball, paddle1, paddle2, score } = state;
    const { scaleX, scaleY } = FIELD_CONFIG;

    renderTick++;
    if (renderTick % 5 === 0) {
        tickStyle = (tickStyle + 1) % 3;
    }

    // Clear the field buffer
    clearField();

    // Draw paddles
    const pad1X = paddle1.x * scaleX + TERM_WIDTH / 2 - 1;
    const pad2X = paddle2.x * scaleX + TERM_WIDTH / 2 - 1;
    const padLen = GAME_CONFIG.PADDLE_DEPTH * scaleY;
    const pad1YMin = paddle1.y * scaleY + TERM_HEIGHT / 2 - padLen / 2;
    const pad2YMin = paddle2.y * scaleY + TERM_HEIGHT / 2 - padLen / 2;
    drawPaddle(FIELD_BUFFER, pad1YMin, padLen, pad1X); // Left paddle
    drawPaddle(FIELD_BUFFER, pad2YMin, padLen, pad2X); // Right paddle

    ballTrail.push({ ...ball }); // Clone the vector
    if (ballTrail.length > BALL_TRAIL_LENGTH) {
        ballTrail.shift(); // Remove oldest
    }

    // Draw ball
    drawBall(FIELD_BUFFER, ball);

    const corners = CORNER_STYLES[tickStyle];

    // Print all the elements
    const border = `${corners.tl}${"~─".repeat(TERM_WIDTH / 2)}${corners.tr}`;
    const bottomBorder = `${corners.bl}${"─~".repeat(TERM_WIDTH / 2)}${corners.br}`;

    console.clear();
    console.log(
        color(`Score:`, FG_CYAN),
        color(` Player 1 - ${score.player1} `, FG_GREEN),
        ":",
        color(` ${score.player2} - Player 2 `, FG_YELLOW)
    );
    console.log(border);
    for (const row of FIELD_BUFFER) {
        console.log(`|${row.join("")}|`);
    }
    console.log(bottomBorder);
}

// Characters to use ╭ ╮ ╰╯ ◯ ◉ 🔴
// █ ▄ ▀
// ▖ ▗ ▘ ▝
