import chalk from "chalk";
import { PongConfig } from "@darrenkuro/pong-core";

export function showLobbyUpdate(payload) {
    const config: PongConfig = payload.config ? payload.config : payload;
    const playerNames: string[] = payload.playerNames ? payload.playerNames : [];

    console.log(chalk.blue("Lobby Update:"));
    console.log(chalk.magenta("Configuration:"));
    console.log(`  - Board: ${config.board.size.width}x${config.board.size.depth}`);
    console.log(`  - Win Points: ${config.playTo}`);
    console.log(chalk.magenta("Players:"));
    if (playerNames.length > 0) {
        playerNames.forEach((player, index) => {
            console.log(`  ${index + 1}. ${player}`);
        });
    } else {
        console.log("  (no players)");
    }
    console.log("\n");
}
