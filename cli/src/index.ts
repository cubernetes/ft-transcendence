import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { WebSocketManager } from "./WebSocketManager";
import { startKeyListener } from "./input";
import { setGameConfig } from "./GameRendering";
import { GameConfig } from "./game.types";
import { optionsMenu, userOptions } from "./options";
import { audioManager } from "./audio";

let wsManager: WebSocketManager | null = null;
let token: string | null = null;
let isGameActive = false;
let startedMenuMusic = false;
let defaultMode = 1;

export function setGameActive(state: boolean) {
    isGameActive = state;
}

export function getGameActive(): boolean {
    return isGameActive;
}

export function cleanup() {
    console.log(chalk.greenBright("See you soon - good luck for your next game!"));
    if (wsManager) {
        wsManager.closeConnection();
    }
    audioManager.stopMusic();
    process.exit(0);
}

// --- Menu Setup ---
export async function mainMenu(): Promise<void> {
    try {
        if (userOptions.music && !startedMenuMusic) {
            audioManager.startMusic("menu");
            startedMenuMusic = true;
        }

        console.clear();

        const title = figlet.textSync(" PONG   CLI", { font: "Small Poison" });
        console.log(chalk.green(title));

        const { mode } = await inquirer.prompt([
            {
                type: "list",
                name: "mode",
                message: figlet.textSync("MAIN MENU", { font: "Soft" }),
                choices: [
                    new inquirer.Separator(),
                    { name: chalk.magenta("🏠  Play Locally"), value: 1 },
                    new inquirer.Separator(),
                    { name: chalk.magenta("🌐  Connect to Server"), value: 2 },
                    new inquirer.Separator(),
                    { name: chalk.magenta("⚙️  Options"), value: 3 },
                    new inquirer.Separator(),
                    { name: chalk.red("🚪  Exit"), value: 0 },
                ],
                default: defaultMode,
            },
        ]);

        if (userOptions.sfx) {
            audioManager.playSoundEffect("blop");
        }
        defaultMode = mode;
        switch (mode) {
            case 1:
                startLocalGame();
                break;
            case 2:
                handleServerLogin();
                break;
            case 3:
                optionsMenu();
                break;
            case 0:
                cleanup();
        }
    } catch (err) {
        cleanup();
    }
}

// --- Server Flow ---
async function fetchGameConfig(): Promise<GameConfig> {
    const res = await fetch("http://localhost:8080/api/games/config");
    if (!res.ok) {
        throw new Error(`Failed to fetch config: ${res.status}`);
    }
    const json = await res.json();
    return json.data;
}

async function handleServerLogin() {
    try {
        if (wsManager) {
            console.log(chalk.yellow("Already logged in and connected to server."));
            return startRemoteGame();
        }

        const answers = await inquirer.prompt([
            { type: "input", name: "username", message: "Username:" },
            { type: "password", name: "password", message: "Password:" },
        ]);

        if (!token) {
            token = "dummy"; // Dummy token for now
            if (!token) {
                console.error(chalk.red("Login failed."));
                return mainMenu();
            }
        }

        await startRemoteGame();
    } catch (err) {
        cleanup();
    }
}

async function loginToServer(username: string, password: string): Promise<string | null> {
    try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        if (!res.ok) return null;

        const data = await res.json();
        return data.token;
    } catch (err) {
        console.error("Login error:", err);
        return null;
    }
}

async function startRemoteGame() {
    try {
        const config = await fetchGameConfig();
        console.log("Fetched game config:", config);
        console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
        setGameConfig(config);

        if (!wsManager) {
            const serverUrl = "ws://localhost:8080/ws";
            // const serverUrl = `ws://localhost:8080/ws?token=${token}`;
            wsManager = new WebSocketManager(serverUrl);
        }

        startedMenuMusic = false;
        isGameActive = true;

        startKeyListener((dir) => {
            if (wsManager) {
                wsManager.sendMessage(`move ${dir}`);
            }
        });
    } catch (err) {
        // console.error("Failed to start remote game!");
        // mainMenu();
        console.error("Failed to start remote game: ", err);
        process.exit(1);
    }
}

// --- Local Flow ---
async function startLocalGame() {
    console.log(chalk.yellow("Local play not implemented yet."));
    mainMenu();
}

// --- Start CLI ---
mainMenu();
