import inquirer from "inquirer";
import { WebSocketManager } from "./WebSocketManager";
import { startKeyListener } from "./input";
import { setGameConfig } from "./GameRendering";
import { GameConfig } from "./game.types";
import { optionsMenu } from "./options.js";
import { audioManager } from "./audio";

console.log(audioManager); // Should log the instance of AudioManager

let wsManager: WebSocketManager | null = null;
let token: string | null = null;
let isGameActive = false;

export function setGameActive(state: boolean) {
    isGameActive = state;
}

export function getGameActive(): boolean {
    return isGameActive;
}

// --- Menu Setup ---

export async function mainMenu(): Promise<void> {
    const { mode } = await inquirer.prompt([
        {
            type: "list",
            name: "mode",
            message: "Welcome to Pong CLI!",
            choices: ["Play Locally", "Connect to Server", "Options", "Exit"],
        },
    ]);

    switch (mode) {
        case "Play Locally":
            startLocalGame();
            break;
        case "Connect to Server":
            handleServerLogin();
            break;
        case "Options":
            optionsMenu();
            break;
        case "Exit":
            console.log("Goodbye!");
            if (wsManager) {
                wsManager.closeConnection(); // Close the WebSocket connection on exit
            }
            process.exit(0);
    }
}

// --- Server Flow ---

async function fetchGameConfig(): Promise<GameConfig> {
    const res = await fetch("http://localhost:8080/api/games/config");
    if (!res.ok) {
        throw new Error(`Failed to fetch config: ${res.status}`);
    }
    return res.json();
}

async function handleServerLogin() {
    // Only log in if the user isn't already logged in
    if (wsManager) {
        console.log("Already logged in and connected to server.");
        return startRemoteGame(); // Skip login if connection is already established
    }

    const answers = await inquirer.prompt([
        { type: "input", name: "username", message: "Username:" },
        { type: "password", name: "password", message: "Password:" },
    ]);

    if (!token) {
        // token = await loginToServer(answers.username, answers.password);
        token = "dummy"; // Dummy token for now

        if (!token) {
            console.error("Login failed.");
            return mainMenu();
        }
    }

    await startRemoteGame();
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
        // Fetch game config from the server
        const config = await fetchGameConfig();
        console.log("Fetched game config:", config);
        console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
        setGameConfig(config);

        if (!wsManager) {
            const serverUrl = "ws://localhost:8080/ws";
            // const serverUrl = `ws://localhost:8080/ws?token=${token}`;
            wsManager = new WebSocketManager(serverUrl);
        }

        // Set game state to active
        isGameActive = true;

        // Start listening for user input to send directions to the server
        startKeyListener((dir) => {
            if (wsManager) {
                wsManager.sendMessage(`move ${dir}`);
            }
        });
    } catch (err) {
        console.error("Failed to start remote game:", err);
        process.exit(1);
    }
}

// --- Local Flow (stub for now) ---

async function startLocalGame() {
    console.log("Local play not implemented yet.");
    // You can integrate local game engine logic here later.
    mainMenu();
}

// --- Start CLI ---

mainMenu();
