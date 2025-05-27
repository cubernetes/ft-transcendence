import chalk from "chalk";
import { Position3D, defaultGameConfig } from "@darrenkuro/pong-core";
import { Ball, Paddle, PongConfig, PongState } from "@darrenkuro/pong-core";
import gameManager from "../game/GameManager";
import { FieldConfig, defaultFieldConfig, userOptions } from "../utils/config";

const BALL_TRAIL_LENGTH = 5;
const TICK_INTERVAL = 5;

const CORNER_STYLES = [
    { tl: "╭", tr: "╮", bl: "╰", br: "╯" },
    { tl: "┌", tr: "┐", bl: "└", br: "┘" },
    { tl: "◤", tr: "◥", bl: "◣", br: "◢" },
    { tl: "▗", tr: "▖", bl: "▝", br: "▘" },
] as const;

const EDGE_STYLES = [
    { hor: "▄▅▆▃", ver: "⡇" },
    { hor: "▅▆▃▄", ver: "⠇" },
    { hor: "▆▃▄▅", ver: "⠃" },
    { hor: "▃▄▅▆", ver: "⠁" },
] as const;

const BALL_CHARS = [
    chalk.white("•"),
    chalk.cyan("○"),
    chalk.blue("●"),
    chalk.green("◉"),
    chalk.red("⬤"),
] as const;

function makeChar(index: number): string {
    return BALL_CHARS[Math.min(index, BALL_CHARS.length - 1)];
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

    #cachedBorders: { top: string; bottom: string } = { top: "", bottom: "" };
    #frameBuffer: string[] = []; // Reusable string array for frame building
    #lastResolution = "";

    #playerNames: [string, string] | null = null;

    constructor(gameConf?: PongConfig, fieldConf?: FieldConfig) {
        this.#gameConf = gameConf || defaultGameConfig;
        this.#fieldConf = fieldConf || defaultFieldConfig;
        this.updateResolution();
    }

    updateResolution(): void {
        const res = userOptions.resolution;

        if (res === this.#lastResolution) return;
        this.#lastResolution = res;

        const resolutions = {
            "80x20": [80, 20],
            "160x40": [160, 40],
            "240x60": [240, 60],
            "320x80": [320, 80],
        } as const;

        const [w, h] = resolutions[res as keyof typeof resolutions] || [80, 20];
        this.#setTerminalSize(w, h);
        this.#setFieldConfig();
        this.#cacheBorders();
    }

    setBoardSize(width: number, depth: number): void {
        this.#gameConf.board.size.width = width;
        this.#gameConf.board.size.depth = depth;
        this.#setFieldConfig();
        this.#cacheBorders();
    }

    setPlayerNames(playerNames: [string, string]): void {
        this.#playerNames = playerNames;
    }

    getPlayerNames(): [string, string] | null {
        return this.#playerNames;
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

    #setTerminalSize(w: number, h: number): void {
        this.#fieldConf.termWid = w;
        this.#fieldConf.termHei = h;
    }

    #setFieldConfig(): void {
        const boardW = this.#gameConf.board.size.width;
        const boardD = this.#gameConf.board.size.depth;
        const termWid = this.#fieldConf.termWid;
        const termHei = this.#fieldConf.termHei;

        this.#halfBoardW = boardW * 0.5;
        this.#halfBoardD = boardD * 0.5;
        this.#invBoardW = 1 / boardW;
        this.#invBoardD = 1 / boardD;
        this.#termWid = termWid;
        this.#termHei = termHei;
        this.#termWidMinus1 = termWid - 1;
        this.#termHeiMinus1 = termHei - 1;

        this.#fieldConf.scaleX = termWid / boardW;
        this.#fieldConf.scaleZ = termHei / boardD;
        this.#fieldConf.paddleHeight = (this.#gameConf.paddles[0].size.depth * termHei) / boardD;

        if (
            !this.#fieldConf.fieldBuffer ||
            this.#fieldConf.fieldBuffer.length !== termHei ||
            this.#fieldConf.fieldBuffer[0]?.length !== termWid
        ) {
            this.#fieldConf.fieldBuffer = Array.from({ length: termHei }, () =>
                new Array(termWid).fill(" ")
            );
        }

        this.#frameBuffer = new Array(termHei + 4); // +4 for header/footer
    }

    #updateRenderTick(): void {
        this.#renderTick++;
        if (this.#renderTick % TICK_INTERVAL === 0) {
            this.#tickStyle = (this.#tickStyle + 1) & 3; // Bitwise AND (&3) is %4 (but faster)
            this.#cacheBorders();
        }
    }

    #cacheBorders(): void {
        const corners = CORNER_STYLES[this.#tickStyle];
        const edges = EDGE_STYLES[this.#tickStyle];
        const horRepeats = Math.floor(this.#termWid / 4);

        this.#cachedBorders.top = `${corners.tl}${edges.hor.repeat(horRepeats)}${corners.tr}`;
        this.#cachedBorders.bottom = `${corners.bl}${edges.hor.repeat(horRepeats)}${corners.br}`;
    }

    #clearField(): void {
        const buffer = this.#fieldConf.fieldBuffer!;
        for (let i = 0; i < buffer.length; i++) {
            buffer[i].fill(" ");
        }
    }

    // #drawFieldEdges(): void {
    //     const { termWid, termHei, fieldBuffer } = this.#fieldConf;
    //     const borderChar = ".";
    //     for (let x = 0; x < termWid; x++) {
    //         fieldBuffer[0][x] = borderChar;
    //         fieldBuffer[termHei - 1][x] = borderChar;
    //     }
    //     for (let y = 0; y < termHei; y++) {
    //         fieldBuffer[y][0] = borderChar;
    //         fieldBuffer[y][termWid - 1] = borderChar;
    //     }
    // }

    // --- Mapping helpers ---
    #gameXToCol(x: number): number {
        return Math.round((x + this.#halfBoardW) * this.#invBoardW * this.#termWidMinus1);
    }

    #gameZToRow(z: number): number {
        return Math.round((z + this.#halfBoardD) * this.#invBoardD * this.#termHeiMinus1);
    }

    #rowToGameZ(row: number): number {
        return (row / this.#termHei) * this.#gameConf.board.size.depth - this.#halfBoardD;
    }

    #drawPaddles(state: PongState): void {
        const buffer = this.#fieldConf.fieldBuffer!;

        for (const paddle of state.paddles) {
            const gx = paddle.pos.x;
            const gz = paddle.pos.z;
            const gw = paddle.size.width;
            const gd = paddle.size.depth;

            const leftColF = this.#gameXToCol(gx - gw * 0.5);
            const rightColF = this.#gameXToCol(gx + gw * 0.5);
            const topRowF = this.#gameZToRow(gz - gd * 0.5);
            const bottomRowF = this.#gameZToRow(gz + gd * 0.5);

            const xStart = Math.max(0, Math.floor(leftColF));
            const xEnd = Math.min(this.#termWidMinus1, Math.ceil(rightColF));
            const zStart = Math.max(0, Math.floor(topRowF));
            const zEnd = Math.min(this.#termHeiMinus1, Math.ceil(bottomRowF));

            for (let x = xStart; x <= xEnd; x++) {
                for (let z = zStart; z <= zEnd; z++) {
                    const cellTop = this.#rowToGameZ(z);
                    const cellBottom = this.#rowToGameZ(z + 1);

                    const overlapTop = Math.max(cellTop, gz - gd * 0.5);
                    const overlapBottom = Math.min(cellBottom, gz + gd * 0.5);
                    const overlap = overlapBottom - overlapTop;

                    const cellHeight = cellBottom - cellTop;
                    const frac = overlap / cellHeight;

                    if (frac >= 0.75) {
                        buffer[z][x] = "█";
                    } else if (frac >= 0.25) {
                        const overlapCenter = (overlapTop + overlapBottom) * 0.5;
                        const cellCenter = (cellTop + cellBottom) * 0.5;
                        buffer[z][x] = overlapCenter < cellCenter ? "▀" : "▄";
                    }
                }
            }
        }
    }

    #drawBall(): void {
        const buffer = this.#fieldConf.fieldBuffer!;
        const trailLength = this.#ballTrail.length;

        for (let i = 0; i < trailLength; i++) {
            const pos = this.#ballTrail[i];
            const x = Math.max(
                0,
                Math.min(this.#termWidMinus1, Math.round(this.#gameXToCol(pos.x)))
            );
            const z = Math.max(
                0,
                Math.min(this.#termHeiMinus1, Math.round(this.#gameZToRow(pos.z)))
            );
            buffer[z][x] = makeChar(i);
        }
    }

    #updateBallTrail(position: Position3D): void {
        this.#ballTrail.push({ ...position });
        if (this.#ballTrail.length > BALL_TRAIL_LENGTH) this.#ballTrail.shift();
    }

    #printFrame(state: PongState): void {
        const buffer = this.#fieldConf.fieldBuffer!;
        const edges = EDGE_STYLES[this.#tickStyle];

        let frameIndex = 0;

        let scoreLine: string;
        if (this.#playerNames && this.#playerNames.length === 2) {
            scoreLine =
                chalk.cyan("Score: ") +
                chalk.green(`${this.#playerNames[0]} - ${state.scores[0]} `) +
                ":" +
                chalk.yellow(` ${state.scores[1]} - ${this.#playerNames[1]}`);
        } else {
            scoreLine =
                chalk.cyan("Score: ") +
                chalk.green(`Player 1 - ${state.scores[0]} `) +
                ":" +
                chalk.yellow(` ${state.scores[1]} - Player 2`);
        }

        this.#frameBuffer[frameIndex++] = scoreLine;
        this.#frameBuffer[frameIndex++] = this.#cachedBorders.top;

        // Game field:
        for (const row of buffer) {
            this.#frameBuffer[frameIndex++] = `${edges.ver}${row.join("")}${edges.ver}`;
        }

        this.#frameBuffer[frameIndex++] = this.#cachedBorders.bottom;

        const frame = this.#frameBuffer.slice(0, frameIndex).join("\n");

        process.stdout.write(`\x1b[?25l\x1b[H${frame}\n\x1b[?25h`);
    }

    async showWinner(
        payload?: {
            winner?: number;
            state?: PongState;
        },
        playerNames?: string[],
        opponentId?: string
    ): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const edges = EDGE_STYLES[this.#tickStyle];

        const winnerIndex = payload?.winner ?? 0;

        let scores: [number, number] | undefined = undefined;
        if (
            payload?.state?.scores &&
            Array.isArray(payload.state.scores) &&
            payload.state.scores.length === 2
        ) {
            scores = payload.state.scores as [number, number];
        }

        let names: [string, string] = ["Player 1", "Player 2"];
        if (playerNames && playerNames.length === 2) {
            names = [playerNames[0], playerNames[1]];
        }

        let winnerText = "";
        if (winnerIndex === 0) {
            winnerText = chalk.green(`🏆 ${names[0]} WINS THE GAME 🏆`);
        } else {
            winnerText = chalk.yellow(`🏆 ${names[1]} WINS THE GAME 🏆`);
        }

        const emptyLine = `${edges.ver}${" ".repeat(this.#termWid)}${edges.ver}`;

        let opponentInfo = "";
        if (winnerIndex === 0 && names[1]) {
            opponentInfo = chalk.cyanBright(
                ` Defeated opponent: ${chalk.bold(names[1])}` +
                    (opponentId ? chalk.gray(` (ID: ${opponentId})`) : "")
            );
        } else if (winnerIndex === 1 && names[0]) {
            opponentInfo = chalk.cyanBright(
                ` Defeated opponent: ${chalk.bold(names[0])}` +
                    (opponentId ? chalk.gray(` (ID: ${opponentId})`) : "")
            );
        }

        let finalScoreText = "";
        if (scores) {
            finalScoreText =
                chalk.cyan("Final Score: ") +
                chalk.green(`${names[0]} - ${scores[0]} `) +
                ":" +
                chalk.yellow(` ${scores[1]} - ${names[1]}`);
        } else {
            finalScoreText = chalk.cyan("Final Score:");
        }

        function centerLine(text: string): string {
            const len = text.replace(/\x1b\[[0-9;]*m/g, "").length;
            const leftPad = Math.floor((this.#termWid - len) * 0.5);
            const rightPad = this.#termWid - len - leftPad;
            return `${edges.ver}${" ".repeat(leftPad)}${text}${" ".repeat(rightPad)}${edges.ver}`;
        }

        const centeredFinalScore = centerLine.call(this, finalScoreText);
        const centeredMessageLine = centerLine.call(this, winnerText);
        const centeredOpponentInfo = opponentInfo ? centerLine.call(this, opponentInfo) : emptyLine;

        const verticalPadding = Math.floor((this.#termHei - 6) * 0.5);

        const frameLines = [
            " ".repeat(this.#termWid),
            this.#cachedBorders.top,
            ...Array(verticalPadding - 3).fill(emptyLine),
            centeredFinalScore,
            emptyLine,
            emptyLine,
            centeredMessageLine,
            emptyLine,
            centeredOpponentInfo,
            ...Array(this.#termHei - verticalPadding - 3).fill(emptyLine),
            this.#cachedBorders.bottom,
            chalk.gray("Press any key to continue..."),
        ];

        const frame = frameLines.join("\n");
        process.stdout.write(`\x1b[?25l\x1b[H${frame}\x1b[?25h`);

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
