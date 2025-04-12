import { dir } from "console";
import audioManager from "../audio/AudioManager";
import gameManager from "../game/GameManager";
import { mainMenu } from "../menu/mainMenu";
import { cleanup } from "../utils/cleanup";
import { ControllerConfig } from "../utils/config";

export class GameController {
    private listeners: Array<() => void> = [];

    constructor(private configs: ControllerConfig[]) {
        const primary = this.configs.find((cfg) => cfg.player === 0);
        if (primary) {
            // Add default arrow/space keys mapped to player 0
            this.configs.push({
                player: primary.player,
                onMove: primary.onMove,
                keyMap: {
                    up: "\u001b[A",
                    down: "\u001b[B",
                    stop: " ",
                },
            });
        }
    }

    start(): void {
        process.stdin.setRawMode(true);
        process.stdin.resume();

        const keyListener = (key: Buffer) => {
            const keyStr = key.toString();

            for (const { keyMap, player, onMove } of this.configs) {
                if (keyStr === keyMap.up) return onMove(player, "down");
                if (keyStr === keyMap.down) return onMove(player, "up");
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
