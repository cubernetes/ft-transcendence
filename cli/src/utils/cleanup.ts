import chalk from "chalk";
import audioManager from "../audio/AudioManager";
import gameManager from "../game/GameManager";

// --- Cleanup ---
export function cleanup(message = "See you soon - good luck for your next game!") {
    console.log(chalk.greenBright(message));
    gameManager.stopGame();
    audioManager.stopMusic();
    process.stdin.setRawMode(false);
    process.exit(0);
}
