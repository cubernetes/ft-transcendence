// import { FieldConfig, GameConfig, PongState } from "./game.types";
import { Position3D, defaultGameConfig } from "@darrenkuro/pong-core";
import { Ball, Paddle, PongConfig, PongState } from "@darrenkuro/pong-core";
import { FieldConfig, defaultFieldConfig, userOptions } from "../utils/config";

const BALL_TRAIL_LENGTH = 5;

const FG_RED = "\x1b[31m";
const FG_GREEN = "\x1b[32m";
const FG_BLUE = "\x1b[34m";
const FG_CYAN = "\x1b[36m";
const FG_YELLOW = "\x1b[33m";
const FG_WHITE = "\x1b[37m";
const RESET = "\x1b[0m";

// TODO: Optimise coloring (maybe with chalk)

const CORNER_STYLES = [
    { tl: "╭", tr: "╮", bl: "╰", br: "╯" },
    { tl: "┌", tr: "┐", bl: "└", br: "┘" },
    { tl: "◤", tr: "◥", bl: "◣", br: "◢" },
    { tl: "▗", tr: "▖", bl: "▝", br: "▘" },
];

const EDGE_STYLES = [
    { hor: "▄▅▆▃", ver: "⡇" },
    { hor: "▅▆▃▄", ver: "⠇" },
    { hor: "▆▃▄▅", ver: "⠃" },
    { hor: "▃▄▅▆", ver: "⠁" },
];

function color(text: string, fg = "", bg = ""): string {
    return `${fg}${bg}${text}${RESET}`;
}

function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

function makeChar(index: number): string {
    const brightness = [FG_WHITE, FG_CYAN, FG_BLUE, FG_GREEN, FG_RED];
    const char = [".", "•", "●", "◉", "⬤"];
    return color(char[Math.min(index, char.length - 1)], brightness[index]);
}

export class CLIRenderer {
    #gameConf: PongConfig;
    #fieldConf: FieldConfig;
    #ballTrail: Position3D[] = [];
    #renderTick = 0;
    #tickStyle = 0;

    constructor(gameConf?: PongConfig, fieldConf?: FieldConfig) {
        this.#gameConf = gameConf || defaultGameConfig;
        this.#fieldConf = fieldConf || defaultFieldConfig;
        this.#applyConfig();
    }

    render(state: PongState) {
        if (!this.#gameConf || !this.#fieldConf.fieldBuffer) {
            throw new Error("Renderer not configured. Call setGameConfig() first.");
        }

        this.#updateRenderTick();
        this.#clearField();
        this.#drawPaddles(state);
        this.#updateBallTrail(state.ball.pos);
        this.#drawBall();
        this.#printFrame(state);
    }

    #applyConfig(): void {
        const res = userOptions.resolution;
        if (res === "80x20") this.#setTerminalSize(80, 20);
        else if (res === "160x40") this.#setTerminalSize(160, 40);
        else if (res === "240x60") this.#setTerminalSize(240, 60);
        else if (res === "320x80") this.#setTerminalSize(320, 80);
        this.#setFieldConfig();
    }

    #setTerminalSize(w: number, h: number): void {
        this.#fieldConf.termWid = w;
        this.#fieldConf.termHei = h;
    }

    #setFieldConfig(): void {
        this.#fieldConf.scaleX = this.#fieldConf.termWid / this.#gameConf.board.size.width;
        this.#fieldConf.scaleY = this.#fieldConf.termHei / this.#gameConf.board.size.depth;
        this.#fieldConf.paddleHeight =
            (this.#gameConf.paddles[0].size.depth * this.#fieldConf.termHei) /
            this.#gameConf.board.size.depth;
        this.#fieldConf.fieldBuffer = Array.from({ length: this.#fieldConf.termHei }, () =>
            Array(this.#fieldConf.termWid).fill(" ")
        );
    }

    #updateRenderTick(): void {
        this.#renderTick++;
        if (this.#renderTick % 5 === 0) {
            this.#tickStyle = (this.#tickStyle + 1) % 4;
        }
    }

    #clearField(): void {
        this.#fieldConf.fieldBuffer?.forEach((row) => row.fill(" "));
    }

    #drawPaddles(state: PongState): void {
        const { scaleX, scaleY, termHei, termWid } = this.#fieldConf;
        const padLen = this.#gameConf.paddles[0].size.depth * scaleY;

        const draw = (yMin: number, padX: number) => {
            const yFracTop = yMin - Math.floor(yMin);
            const yFracBottom = yMin + padLen - Math.floor(yMin + padLen);
            const rowTop = Math.floor(yMin);
            const rowBottom = Math.floor(yMin + padLen) - 1;

            if (rowTop >= 0 && rowTop < termHei) {
                this.#fieldConf.fieldBuffer[rowTop][padX] =
                    yFracTop < 0.25 ? "█" : yFracTop < 0.75 ? "▄" : " ";
            }
            for (let y = Math.ceil(yMin); y <= Math.floor(yMin + padLen - 1); y++) {
                if (y >= 0 && y < termHei) this.#fieldConf.fieldBuffer[y][padX] = "█";
            }
            if (rowBottom >= 0 && rowBottom < termHei) {
                this.#fieldConf.fieldBuffer[rowBottom][padX] =
                    yFracBottom >= 0.75 ? "█" : yFracBottom >= 0.25 ? "▀" : " ";
            }
        };

        const pad1X = Math.round(state.paddles[0].pos.x * scaleX + termWid / 2 - 1);
        const pad2X = Math.round(state.paddles[1].pos.x * scaleX + termWid / 2 - 1);
        const pad1Y = state.paddles[0].pos.y * scaleY + termHei / 2 - padLen / 2;
        const pad2Y = state.paddles[1].pos.y * scaleY + termHei / 2 - padLen / 2;

        draw(pad1Y, pad1X);
        draw(pad2Y, pad2X);
    }

    #updateBallTrail(position: Position3D): void {
        this.#ballTrail.push({ ...position });
        if (this.#ballTrail.length > BALL_TRAIL_LENGTH) this.#ballTrail.shift();
    }

    #drawBall(): void {
        const { scaleX, scaleY, termWid, termHei, fieldBuffer } = this.#fieldConf;
        for (let i = 0; i < this.#ballTrail.length; i++) {
            const pos = this.#ballTrail[i];
            const x = clamp(Math.round(pos.x * scaleX + termWid / 2 - 1), 0, termWid - 1);
            const y = clamp(Math.round(pos.y * scaleY + termHei / 2 - 1), 0, termHei - 1);
            fieldBuffer[y][x] = makeChar(i);
        }
    }

    #printFrame(state: PongState): void {
        const { termWid, termHei, fieldBuffer } = this.#fieldConf;

        const corners = CORNER_STYLES[this.#tickStyle];
        const edges = EDGE_STYLES[this.#tickStyle];

        const border = `${corners.tl}${edges.hor.repeat(termWid / 4)}${corners.tr}`;
        const bottomBorder = `${corners.bl}${edges.hor.repeat(termWid / 4)}${corners.br}`;

        let frame = "\x1b[H"; // top-left
        frame += color(`Score:`, FG_CYAN) + " ";
        frame += color(` Player 1 - ${state.scores[0]} `, FG_GREEN);
        frame += ":" + color(` ${state.scores[1]} - Player 2 `, FG_YELLOW) + "\n";
        frame += border + "\n";

        for (const row of fieldBuffer) {
            frame += `${edges.ver}${row.join("")}${edges.ver}\n`;
        }

        frame += bottomBorder + "\n";

        process.stdout.write("\x1b[?25l\x1b[H" + frame + "\x1b[?25h");
    }
}

// let gameConf: GameConfig | null = null;
// let fieldConf: FieldConfig = {
//     termWid: 160,
//     termHei: 40,
//     scaleX: 0,
//     scaleY: 0,
//     paddleHeight: 0,
//     fieldBuffer: null,
// };

// let ballTrail: Vec2D[] = [];
// let renderTick = 0;
// let tickStyle = 0;

// const CORNER_STYLES = [
//     { tl: "╭", tr: "╮", bl: "╰", br: "╯" },
//     { tl: "┌", tr: "┐", bl: "└", br: "┘" },
//     { tl: "◤", tr: "◥", bl: "◣", br: "◢" },
//     { tl: "▗", tr: "▖", bl: "▝", br: "▘" },
// ];

// const EDGE_STYLES = [
//     { hor: "▄▅▆▃", ver: "⡇" },
//     { hor: "▅▆▃▄", ver: "⠇" },
//     { hor: "▆▃▄▅", ver: "⠃" },
//     { hor: "▃▄▅▆", ver: "⠁" },
// ];

// function color(text: string, fg: string = "", bg: string = ""): string {
//     return `${fg}${bg}${text}${RESET}`;
// }

// function setTerminalSize(w: number, h: number): void {
//     fieldConf.termWid = w;
//     fieldConf.termHei = h;
// }

// // for now, just set the terminal size based on the resolution
// function applySettings(): void {
//     if (userOptions.resolution === "80x20") {
//         setTerminalSize(80, 20);
//     } else if (userOptions.resolution === "160x40") {
//         setTerminalSize(160, 40);
//     } else if (userOptions.resolution === "240x60") {
//         setTerminalSize(240, 60);
//     } else {
//         setTerminalSize(320, 80);
//     }
//     if (userOptions.playStyle === "crazy") {
//         // paddle in rainbow / ball animation / flashing colors / ball trail
//     } else if (userOptions.playStyle === "stylish") {
//         // paddle in gradient / ball animation / flashing colors
//     }
// }

// function setFieldConfig() {
//     fieldConf.scaleX = fieldConf.termWid / gameConf!.BOARD_WIDTH;
//     fieldConf.scaleY = fieldConf.termHei / gameConf!.BOARD_DEPTH;
//     fieldConf.paddleHeight = (gameConf!.PADDLE_DEPTH * fieldConf.termHei) / gameConf!.BOARD_DEPTH;
//     fieldConf.fieldBuffer = Array.from({ length: fieldConf.termHei }, () =>
//         Array(fieldConf.termWid).fill(" ")
//     );
// }

// export function setGameConfig(config: GameConfig) {
//     gameConf = config;
//     applySettings();
//     setFieldConfig();
// }

// function drawPaddle(field: string[][], padYMin: number, padLen: number, padX: number): void {
//     const yBeginFrac = padYMin - Math.floor(padYMin);
//     const yEndFrac = padYMin + padLen - Math.floor(padYMin + padLen);

//     const rowTop = Math.floor(padYMin);
//     const rowBottom = Math.floor(padYMin + padLen) - 1;

//     // Top cap
//     if (rowTop >= 0 && rowTop < field.length) {
//         if (yBeginFrac < 0.25) {
//             field[rowTop][padX] = "█";
//         } else if (yBeginFrac < 0.75) {
//             field[rowTop][padX] = "▄";
//         }
//     }
//     // Full body
//     const yStart = Math.ceil(padYMin);
//     const yEnd = Math.floor(padYMin + padLen - 1);
//     for (let y = yStart; y <= yEnd; y++) {
//         if (y >= 0 && y < field.length) {
//             field[y][padX] = "█";
//         }
//     }
//     // Bottom cap
//     if (rowBottom >= 0 && rowBottom < field.length) {
//         if (yEndFrac >= 0.25 && yEndFrac < 0.75) {
//             field[rowBottom][padX] = "▀";
//         } else if (yEndFrac >= 0.75) {
//             field[rowBottom][padX] = "█";
//         }
//     }
// }

// function clamp(val: number, min: number, max: number): number {
//     return Math.max(min, Math.min(max, val));
// }

// function clearField() {
//     fieldConf.fieldBuffer?.forEach((row) => row.fill(" "));
// }

// const makeChar = (index: number) => {
//     const brightness = [FG_WHITE, FG_CYAN, FG_BLUE, FG_GREEN, FG_RED];
//     const char = [".", "•", "●", "◉", "⬤"];
//     return color(char[Math.min(index, char.length - 1)], brightness[index]);
// };

// // Draw ball with clamping handled in a utility function for reusability
// function drawBall(field: string[][], ballPos: Vec2D): void {
//     if (!fieldConf) {
//         throw new Error("Field config not set. Call setGameConfig() before rendering.");
//     }
//     const { scaleX, scaleY, termWid, termHei } = fieldConf;
//     for (let i = 0; i < ballTrail.length; i++) {
//         const pos = ballTrail[i];
//         const ballX = clamp(Math.round(pos.x * scaleX + termWid / 2 - 1), 0, termWid - 1);
//         const ballY = clamp(Math.round(pos.y * scaleY + termHei / 2 - 1), 0, termHei - 1);
//         field[ballY][ballX] = makeChar(i);
//     }
// }

// export function renderGameState(state: PongState) {
//     if (!gameConf || !fieldConf.fieldBuffer) {
//         throw new Error("Game config not set. Call setGameConfig() before rendering.");
//     }
//     const { ball, paddle1, paddle2, score } = state;
//     const { scaleX, scaleY, termHei, termWid, fieldBuffer } = fieldConf;

//     if (state.lastCollisionEvents && userOptions.sfx) {
//         for (const event of state.lastCollisionEvents) {
//             switch (event.type) {
//                 case "paddle":
//                     audioManager.playSoundEffect("paddle_hit");
//                     break;
//                 case "wall":
//                     audioManager.playSoundEffect("wall_hit");
//                     break;
//                 case "score":
//                     audioManager.playSoundEffect("score");
//                     break;
//             }
//         }
//     }

//     renderTick++;
//     if (renderTick % 5 === 0) {
//         tickStyle = (tickStyle + 1) % 4;
//     }

//     clearField();

//     // Draw paddles
//     const pad1X = paddle1.x * scaleX + termWid / 2 - 1;
//     const pad2X = paddle2.x * scaleX + termWid / 2 - 1;
//     const padLen = gameConf.PADDLE_DEPTH * scaleY;
//     const pad1YMin = paddle1.y * scaleY + termHei / 2 - padLen / 2;
//     const pad2YMin = paddle2.y * scaleY + termHei / 2 - padLen / 2;
//     drawPaddle(fieldBuffer, pad1YMin, padLen, pad1X); // Left paddle
//     drawPaddle(fieldBuffer, pad2YMin, padLen, pad2X); // Right paddle

//     ballTrail.push({ ...ball }); // Clone the vector
//     if (ballTrail.length > BALL_TRAIL_LENGTH) {
//         ballTrail.shift(); // Remove oldest
//     }

//     // Draw ball
//     drawBall(fieldBuffer, ball);

//     const corners = CORNER_STYLES[tickStyle];
//     const edges = EDGE_STYLES[tickStyle];

//     // Print all the elements
//     const border = `${corners.tl}${edges.hor.repeat(termWid / 4)}${corners.tr}`;
//     const bottomBorder = `${corners.bl}${edges.hor.repeat(termWid / 4)}${corners.br}`;

//     let frameBuffer = ""; // Store the frame

//     frameBuffer += `\x1b[H`; // Move cursor to the top-left
//     frameBuffer += color(`Score:`, FG_CYAN) + " ";
//     frameBuffer += color(` Player 1 - ${score.player1} `, FG_GREEN);
//     frameBuffer += ":" + color(` ${score.player2} - Player 2 `, FG_YELLOW) + "\n";
//     frameBuffer += border + "\n";

//     // frameBuffer += "\x1b[43m"; // Set background color to green
//     for (const row of fieldBuffer) {
//         frameBuffer += `${edges.ver}${row.join("")}${edges.ver}\n`;
//     }
//     // frameBuffer += RESET; // Reset background

//     frameBuffer += bottomBorder + "\n";

//     process.stdout.write("\x1b[?25l"); // Hide cursor
//     process.stdout.write("\x1b[H"); // Move cursor to the top-left
//     process.stdout.write(frameBuffer);
//     process.stdout.write("\x1b[?25h"); // Show cursor
// }

// // ▁▂▃▄▅▆▇█
// // ⡇⡆⡄⡀⡄⡆⡇⠇⠃⠁

// // Characters to use ╭ ╮ ╰╯ ◯ ◉ 🔴 ⬤
// // █ ▄ ▀
// // ▖ ▗ ▘ ▝
