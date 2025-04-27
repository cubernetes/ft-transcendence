import chalk from "chalk";
import { Position3D, defaultGameConfig } from "@darrenkuro/pong-core";
import { Ball, Paddle, PongConfig, PongState } from "@darrenkuro/pong-core";
import { FieldConfig, defaultFieldConfig, userOptions } from "../utils/config";

const BALL_TRAIL_LENGTH = 5;

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

function makeChar(index: number): string {
    const styles = [chalk.white, chalk.cyan, chalk.blue, chalk.green, chalk.red];
    const chars = ["•", "○", "●", "◉", "⬤"];
    const safeIndex = Math.min(index, chars.length - 1);
    return styles[safeIndex](chars[safeIndex]);
}

export class CLIRenderer {
    #gameConf: PongConfig;
    #fieldConf: FieldConfig;
    #ballTrail: Position3D[] = [];
    #renderTick = 0;
    #tickStyle = 0;

    #halfBoardW = 0;
    #halfBoardD = 0;
    #invBoardW = 0;
    #invBoardD = 0;
    #termWid = 0;
    #termHei = 0;
    #termWidMinus1 = 0;
    #termHeiMinus1 = 0;

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
        // this.#drawFieldEdges();
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
        const boardW = this.#gameConf.board.size.width;
        const boardD = this.#gameConf.board.size.depth;
        const termWid = this.#fieldConf.termWid;
        const termHei = this.#fieldConf.termHei;

        this.#halfBoardW = boardW / 2;
        this.#halfBoardD = boardD / 2;
        this.#invBoardW = 1 / boardW;
        this.#invBoardD = 1 / boardD;
        this.#termWid = termWid;
        this.#termHei = termHei;
        this.#termWidMinus1 = termWid - 1;
        this.#termHeiMinus1 = termHei - 1;

        this.#fieldConf.scaleX = termWid / boardW;
        this.#fieldConf.scaleZ = termHei / boardD;
        this.#fieldConf.paddleHeight = (this.#gameConf.paddles[0].size.depth * termHei) / boardD;
        this.#fieldConf.fieldBuffer = Array.from({ length: termHei }, () =>
            Array(termWid).fill(" ")
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

    #drawFieldEdges(): void {
        const { termWid, termHei, fieldBuffer } = this.#fieldConf;
        const borderChar = ".";
        for (let x = 0; x < termWid; x++) {
            fieldBuffer[0][x] = borderChar;
            fieldBuffer[termHei - 1][x] = borderChar;
        }
        for (let y = 0; y < termHei; y++) {
            fieldBuffer[y][0] = borderChar;
            fieldBuffer[y][termWid - 1] = borderChar;
        }
    }

    // --- Mapping helpers ---
    #gameXToCol(x: number): number {
        return (x + this.#halfBoardW) * this.#invBoardW * this.#termWid;
    }
    #gameZToRow(z: number): number {
        return (z + this.#halfBoardD) * this.#invBoardD * this.#termHei;
    }
    #colToGameX(col: number): number {
        return (col / this.#termWid) * this.#gameConf.board.size.width - this.#halfBoardW;
    }
    #rowToGameZ(row: number): number {
        return (row / this.#termHei) * this.#gameConf.board.size.depth - this.#halfBoardD;
    }

    #drawPaddles(state: PongState): void {
        const draw = (paddle: Paddle) => {
            const gx = paddle.pos.x,
                gz = paddle.pos.z;
            const gw = paddle.size.width,
                gd = paddle.size.depth;

            const leftColF = this.#gameXToCol(gx - gw / 2);
            const rightColF = this.#gameXToCol(gx + gw / 2);
            const topRowF = this.#gameZToRow(gz - gd / 2);
            const bottomRowF = this.#gameZToRow(gz + gd / 2);

            for (
                let x = Math.max(0, Math.floor(leftColF));
                x <= Math.min(this.#termWidMinus1, Math.ceil(rightColF));
                x++
            ) {
                for (
                    let z = Math.max(0, Math.floor(topRowF));
                    z <= Math.min(this.#termHeiMinus1, Math.ceil(bottomRowF));
                    z++
                ) {
                    const cellTop = this.#rowToGameZ(z);
                    const cellBottom = this.#rowToGameZ(z + 1);

                    const overlapTop = Math.max(cellTop, gz - gd / 2);
                    const overlapBottom = Math.min(cellBottom, gz + gd / 2);
                    const overlap = overlapBottom - overlapTop;

                    const cellHeight = cellBottom - cellTop;
                    const frac = overlap / cellHeight;

                    if (frac >= 0.75) {
                        this.#fieldConf.fieldBuffer[z][x] = "█";
                    } else if (frac >= 0.25) {
                        const overlapCenter = (overlapTop + overlapBottom) / 2;
                        const cellCenter = (cellTop + cellBottom) / 2;
                        this.#fieldConf.fieldBuffer[z][x] = overlapCenter < cellCenter ? "▀" : "▄";
                    }
                }
            }
        };
        draw(state.paddles[0]);
        draw(state.paddles[1]);
    }

    #drawBall(): void {
        const { fieldBuffer } = this.#fieldConf;
        for (let i = 0; i < this.#ballTrail.length; i++) {
            const pos = this.#ballTrail[i];
            const x = Math.max(
                0,
                Math.min(this.#termWidMinus1, Math.round(this.#gameXToCol(pos.x)))
            );
            const z = Math.max(
                0,
                Math.min(this.#termHeiMinus1, Math.round(this.#gameZToRow(pos.z)))
            );
            fieldBuffer[z][x] = makeChar(i);
        }
    }

    #updateBallTrail(position: Position3D): void {
        this.#ballTrail.push({ ...position });
        if (this.#ballTrail.length > BALL_TRAIL_LENGTH) this.#ballTrail.shift();
    }

    #printFrame(state: PongState): void {
        const { termWid, fieldBuffer } = this.#fieldConf;

        const corners = CORNER_STYLES[this.#tickStyle];
        const edges = EDGE_STYLES[this.#tickStyle];

        const border = `${corners.tl}${edges.hor.repeat(termWid / 4)}${corners.tr}`;
        const bottomBorder = `${corners.bl}${edges.hor.repeat(termWid / 4)}${corners.br}`;

        let frame = "\x1b[H"; // top-left
        frame += chalk.cyan("Score:") + " ";
        frame += chalk.green(` Player 1 - ${state.scores[0]} `);
        frame += ":" + chalk.yellow(` ${state.scores[1]} - Player 2 `) + "\n";
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
                ? chalk.green("🏆 PLAYER 1 WINS THE GAME 🏆")
                : chalk.yellow("🏆 PLAYER 2 WINS THE GAME 🏆");

        const emptyLine = `${edges.ver}${" ".repeat(termWid)}${edges.ver}`;
        const centeredMessageLine = `${edges.ver}${" ".repeat(
            Math.floor((termWid - winnerText.length) / 2 + 5)
        )}${winnerText}${" ".repeat(Math.ceil((termWid - winnerText.length) / 2 + 5))}${edges.ver}`;

        let frame = "\x1b[H"; // top-left
        frame += chalk.cyan("Final Score:") + "\n";
        frame += border + "\n";

        const verticalPadding = Math.floor((termHei - 3) / 2); // room for centered message
        for (let i = 0; i < verticalPadding; i++) frame += emptyLine + "\n";
        frame += centeredMessageLine + "\n";
        frame += emptyLine + "\n";
        for (let i = 0; i < termHei - verticalPadding - 2; i++) frame += emptyLine + "\n";

        frame += bottomBorder + "\n";
        frame += chalk.gray("Press any key to continue...\n");

        process.stdout.write("\x1b[?25l\x1b[H" + frame + "\x1b[?25h");

        await new Promise<void>((resolve) => {
            process.stdin.setRawMode(true);
            process.stdin.resume();
            process.stdin.once("data", () => {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve();
            });
        });
    }
}
// // ▁▂▃▄▅▆▇█
// // ⡇⡆⡄⡀⡄⡆⡇⠇⠃⠁

// // Characters to use ╭ ╮ ╰╯ ◯ ◉ 🔴 ⬤
// // █ ▄ ▀
// // ▖ ▗ ▘ ▝
