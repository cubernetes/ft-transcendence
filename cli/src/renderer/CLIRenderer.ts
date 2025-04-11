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
        this.#fieldConf.scaleZ = this.#fieldConf.termHei / this.#gameConf.board.size.depth;
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
        const { scaleX, scaleZ, termHei, termWid } = this.#fieldConf;
        const padLen = this.#gameConf.paddles[0].size.depth * scaleZ;

        const draw = (zMin: number, padX: number) => {
            const zFracTop = zMin - Math.floor(zMin);
            const zFracBottom = zMin + padLen - Math.floor(zMin + padLen);
            const rowTop = Math.floor(zMin);
            const rowBottom = Math.floor(zMin + padLen) - 1;

            if (rowTop >= 0 && rowTop < termHei) {
                this.#fieldConf.fieldBuffer[rowTop][padX] =
                    zFracTop < 0.25 ? "█" : zFracTop < 0.75 ? "▄" : " ";
            }
            for (let z = Math.ceil(zMin); z <= Math.floor(zMin + padLen - 1); z++) {
                if (z >= 0 && z < termHei) this.#fieldConf.fieldBuffer[z][padX] = "█";
            }
            if (rowBottom >= 0 && rowBottom < termHei) {
                this.#fieldConf.fieldBuffer[rowBottom][padX] =
                    zFracBottom >= 0.75 ? "█" : zFracBottom >= 0.25 ? "▀" : " ";
            }
        };

        const pad1X = Math.round(state.paddles[0].pos.x * scaleX + termWid / 2 - 1);
        const pad2X = Math.round(state.paddles[1].pos.x * scaleX + termWid / 2 - 1);
        const pad1Z = state.paddles[0].pos.z * scaleZ + termHei / 2 - padLen / 2;
        const pad2Z = state.paddles[1].pos.z * scaleZ + termHei / 2 - padLen / 2;

        draw(pad1Z, pad1X);
        draw(pad2Z, pad2X);
    }

    #updateBallTrail(position: Position3D): void {
        this.#ballTrail.push({ ...position });
        if (this.#ballTrail.length > BALL_TRAIL_LENGTH) this.#ballTrail.shift();
    }

    #drawBall(): void {
        const { scaleX, scaleZ, termWid, termHei, fieldBuffer } = this.#fieldConf;
        for (let i = 0; i < this.#ballTrail.length; i++) {
            const pos = this.#ballTrail[i];
            const x = clamp(Math.round(pos.x * scaleX + termWid / 2 - 1), 0, termWid - 1);
            const z = clamp(Math.round(pos.z * scaleZ + termHei / 2 - 1), 0, termHei - 1);
            fieldBuffer[z][x] = makeChar(i);
        }
    }

    #printFrame(state: PongState): void {
        const { termWid, fieldBuffer } = this.#fieldConf;

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

    async showWinner(winnerIndex: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 500));

        const { termWid, termHei } = this.#fieldConf;
        const corners = CORNER_STYLES[this.#tickStyle];
        const edges = EDGE_STYLES[this.#tickStyle];

        const border = `${corners.tl}${edges.hor.repeat(termWid / 4)}${corners.tr}`;
        const bottomBorder = `${corners.bl}${edges.hor.repeat(termWid / 4)}${corners.br}`;

        const winnerText =
            winnerIndex === 0
                ? color("🏆 PLAYER 1 WINS THE GAME 🏆", FG_GREEN)
                : color("🏆 PLAYER 2 WINS THE GAME 🏆", FG_YELLOW);

        const emptyLine = `${edges.ver}${" ".repeat(termWid)}${edges.ver}`;
        const centeredMessageLine = `${edges.ver}${" ".repeat(
            Math.floor((termWid - winnerText.length) / 2)
        )}${winnerText}${" ".repeat(Math.ceil((termWid - winnerText.length) / 2))}${edges.ver}`;

        let frame = "\x1b[H"; // top-left
        frame += color("Final Score:", FG_CYAN) + "\n";
        frame += border + "\n";

        const verticalPadding = Math.floor((termHei - 3) / 2); // room for centered message
        for (let i = 0; i < verticalPadding; i++) frame += emptyLine + "\n";
        frame += centeredMessageLine + "\n";
        for (let i = 0; i < termHei - verticalPadding - 1; i++) frame += emptyLine + "\n";

        frame += bottomBorder + "\n";

        process.stdout.write("\x1b[?25l\x1b[H" + frame + "\x1b[?25h");

        await new Promise((resolve) => setTimeout(resolve, 4000));
    }
}

// // ▁▂▃▄▅▆▇█
// // ⡇⡆⡄⡀⡄⡆⡇⠇⠃⠁

// // Characters to use ╭ ╮ ╰╯ ◯ ◉ 🔴 ⬤
// // █ ▄ ▀
// // ▖ ▗ ▘ ▝
