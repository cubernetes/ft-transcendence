import chalk from "chalk";
import readline from "readline";
import { PongConfig } from "@darrenkuro/pong-core";

// Function to print lobby info / updates from line 16
export function showLobbyUpdate(payload) {
    const config: PongConfig = payload.config ? payload.config : payload;
    const playerNames: string[] = payload.playerNames ? payload.playerNames : [];

    let line = 16;

    readline.cursorTo(process.stdout, 0, line++);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(chalk.blue(" Game Configuration:") + "\n");

    readline.cursorTo(process.stdout, 0, line++);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`    - Board: ${config.board.size.width}x${config.board.size.depth}\n`);

    readline.cursorTo(process.stdout, 0, line++);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`    - Win Points: ${config.playTo}\n`);

    readline.cursorTo(process.stdout, 0, line++);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(chalk.magenta("  Players:") + "\n");

    readline.cursorTo(process.stdout, 0, line++);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`    1. ${playerNames[0] ? playerNames[0] : chalk.gray("(empty)")}\n`);

    readline.cursorTo(process.stdout, 0, line++);
    readline.clearLine(process.stdout, 0);
    if (playerNames[1]) {
        process.stdout.write(`    2. ${playerNames[1]}\n`);
    } else {
        process.stdout.write(
            `    2. ` + chalk.hex("#FFA500").italic("... waiting for other player ...") + "\n"
        );
    }
}
