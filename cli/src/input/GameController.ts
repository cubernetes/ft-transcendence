import gameManager from "../game/GameManager";
import { cleanup } from "../utils/cleanup";
import { ControllerConfig } from "../utils/config";

export class GameController {
    private listeners: Array<() => void> = [];
    private lastDirection: Map<number, "up" | "down" | "stop"> = new Map();

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
                if (keyStr === keyMap.up) {
                    const lastDir = this.lastDirection.get(player);
                    if (lastDir === "up") {
                        onMove(player, "stop");
                        this.lastDirection.set(player, "stop");
                    } else {
                        onMove(player, "down");
                        this.lastDirection.set(player, "up");
                    }
                    return;
                }
                if (keyStr === keyMap.down) {
                    const lastDir = this.lastDirection.get(player);
                    if (lastDir === "down") {
                        onMove(player, "stop");
                        this.lastDirection.set(player, "stop");
                    } else {
                        onMove(player, "up");
                        this.lastDirection.set(player, "down");
                    }
                    return;
                }
                if (keyStr === keyMap.stop && this.lastDirection.get(player) !== "stop") {
                    onMove(player, "stop");
                    this.lastDirection.set(player, "stop");
                    return;
                }
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
