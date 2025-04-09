import chalk from "chalk";
import { wsManager } from "../ws/wsManager";
import audioManager from "./audio";

// --- Cleanup ---
export function cleanup(message = "See you soon - good luck for your next game!") {
    console.log(chalk.greenBright(message));
    if (wsManager) {
        wsManager.closeConnection();
    }
    audioManager.stopMusic();
    process.stdin.setRawMode(false);
    process.exit(0);
}
