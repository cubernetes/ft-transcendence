import chalk from "chalk";
import { PongConfig } from "@darrenkuro/pong-core";

export function showLobbyUpdate(payload) {
    const config = payload.config as PongConfig;
    console.log(chalk.blue("Lobby Update:"));
    console.log(chalk.magenta("Configuration:"));
    console.log(`  - Board Size: ${config.board.size.width}x${config.board.size.depth}`);
    console.log(`  - Win Points: ${config.playTo}`);
    console.log(chalk.magenta("Players:"));
    payload.playerNames.forEach((player, index) => {
        console.log(`  ${index + 1}. ${player}`);
    });
}
