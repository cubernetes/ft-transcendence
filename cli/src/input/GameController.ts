import audioManager from "../audio/audioManager";
import gameManager from "../game/GameManager";
import { mainMenu } from "../menu/mainMenu";
import { cleanup } from "../utils/cleanup";
import { ControllerConfig } from "../utils/config";

export class GameController {
    private listeners: Array<() => void> = [];

    constructor(private configs: ControllerConfig[]) {}

    start(): void {
        process.stdin.setRawMode(true);
        process.stdin.resume();

        const keyListener = (key: Buffer) => {
            const keyStr = key.toString();

            for (const { keyMap, player, onMove } of this.configs) {
                if (keyStr === keyMap.up) return onMove(player, "up");
                if (keyStr === keyMap.down) return onMove(player, "down");
                if (keyStr === keyMap.stop) return onMove(player, "stop");
            }

            // Ctrl+C --> hard exit
            if (keyStr === "\u0003") {
                this.cleanup();
                cleanup();
                process.exit();
            }

            // ESC
            if (keyStr === "\u001b") {
                this.cleanup();
                gameManager.stopGame();
                mainMenu();
            }
        };

        process.stdin.on("data", keyListener);
        this.listeners.push(() => process.stdin.removeListener("data", keyListener));
    }

    cleanup(): void {
        for (const off of this.listeners) off();
        this.listeners = [];
        process.stdin.setRawMode(false);
    }
}

// // Function to start listening for key presses
// export function startKeyListener(onDir: (d: "up" | "down" | "stop") => void) {
//     let upPressed = false;
//     let downPressed = false;

//     audioManager.startMusic();

//     // Enable raw mode to capture keypresses directly
//     process.stdin.setRawMode(true);
//     process.stdin.resume();

//     // Define the key listener
//     const keyListener = (key: Buffer) => {
//         const keyN = key.toString();

//         // Up direction: Arrow up or User-defined key
//         if ((keyN === "\u001b[A" || keyN === userOptions.controls.p1Up) && !upPressed) {
//             upPressed = true;
//             downPressed = false;
//             onDir("down");
//         }
//         // Down direction: Arrow down or User-defined key
//         else if ((keyN === "\u001b[B" || keyN === userOptions.controls.p1Down) && !downPressed) {
//             downPressed = true;
//             upPressed = false;
//             onDir("up");
//         }
//         // Stop: Space or User-defined key
//         else if (keyN === " " || keyN === userOptions.controls.p1Stop) {
//             downPressed = false;
//             upPressed = false;
//             onDir("stop");
//         }

//         // Exit the game with Ctrl+C --> hard exit
//         else if (keyN === "\u0003") {
//             process.stdin.removeListener("data", keyListener);
//             cleanup();
//             process.exit();
//         }

//         // ESC
//         else if (keyN === "\u001b") {
//             process.stdin.setRawMode(false);
//             process.stdin.removeListener("data", keyListener);
//             setGameActive(false);
//             mainMenu();
//         }
//     };
//     process.stdin.on("data", keyListener);
// }
