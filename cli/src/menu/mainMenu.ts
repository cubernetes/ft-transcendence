import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { PongConfig } from "@darrenkuro/pong-core";
import audioManager from "../audio/audioManager";
import gameManager from "../game/GameManager";
import { cleanup } from "../utils/cleanup";
import { API_URL, GAME_FETCH_ERROR_MSG, MENU_MUSIC, SERVER_URL } from "../utils/config";
import { clearToken, getToken, setToken } from "./auth";
import { optionsMenu } from "./options";

let isGameActive = false;
let startedMenuMusic = false;
let defaultMode = 1;

export function setGameActive(state: boolean) {
    isGameActive = state;
    if (state) startedMenuMusic = false;
}

export function setStartedMenuMusic(state: boolean) {
    startedMenuMusic = state;
}

export function getStartedMenuMusic(): boolean {
    return startedMenuMusic;
}

export function getGameActive(): boolean {
    return isGameActive;
}

export async function mainMenu(): Promise<void> {
    try {
        startMenuMusic();
        printTitle();
        const mode = await promptMainMenu();
        await handleMenuSelection(mode);
    } catch (err) {
        cleanup();
    }
}

function startMenuMusic(): void {
    if (!startedMenuMusic) {
        audioManager.startMusic(MENU_MUSIC);
        startedMenuMusic = true;
    }
}

function printTitle(): void {
    console.clear();
    const title = figlet.textSync(" PONG   CLI", { font: "Small Poison" });
    console.log(chalk.green(title));
}

async function promptMainMenu(): Promise<number> {
    const { mode } = await inquirer.prompt([
        {
            type: "list",
            name: "mode",
            message: figlet.textSync("MAIN MENU", { font: "Soft" }),
            choices: [
                new inquirer.Separator(),
                { name: chalk.magenta("🏠  Play Locally"), value: 1 },
                new inquirer.Separator(),
                { name: chalk.magenta("🌐  Remote Play"), value: 2 },
                new inquirer.Separator(),
                { name: chalk.magenta("⚙️  Options"), value: 3 },
                new inquirer.Separator(),
                { name: chalk.red("🚪  Exit"), value: 0 },
            ],
            default: defaultMode,
        },
    ]);

    audioManager.playSoundEffect("blop");
    defaultMode = mode;
    return mode;
}

async function handleMenuSelection(mode: number): Promise<void> {
    switch (mode) {
        case 1:
            await gameManager.start1PLocal();
            break;
        case 2:
            handleServerLogin();
            break;
        case 3:
            optionsMenu();
            break;
        case 0:
            cleanup();
            break;
        default:
            cleanup("Invalid mode option.");
    }
}

// --- Server Flow ---
async function fetchGameConfig(): Promise<PongConfig> {
    try {
        const res = await fetch(`${API_URL}/game/config`);
        if (!res.ok) throw new Error(GAME_FETCH_ERROR_MSG);
        const json = await res.json();
        return json.data;
    } catch (err) {
        console.error(chalk.red(GAME_FETCH_ERROR_MSG), err);
        cleanup("Error fetching game config.");
        return Promise.reject(err);
    }
}

async function handleServerLogin() {
    try {
        const { username, password } = await inquirer.prompt([
            { type: "input", name: "username", message: "Username:" },
            { type: "password", name: "password", message: "Password:" },
        ]);

        const token = await loginToServer(username, password);

        if (!token) {
            const { action } = await inquirer.prompt([
                {
                    type: "list",
                    name: "action",
                    message: "Login failed. What do you want to do?",
                    choices: [
                        { name: "Try again", value: "retry" },
                        { name: "Register new account", value: "register" },
                        { name: "Back to Menu", value: "back" },
                    ],
                },
            ]);

            switch (action) {
                case "retry":
                    return await handleServerLogin();
                case "register":
                    await registerUser();
                    return await handleServerLogin();
                case "back":
                default:
                    return await mainMenu();
            }
        }

        setToken(token);
        gameManager.start1PRemote();
    } catch (err) {
        cleanup("Error during login.");
    }
}

async function loginToServer(username: string, password: string): Promise<string | null> {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
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

async function registerUser(): Promise<void> {
    const { username, password } = await inquirer.prompt([
        { type: "input", name: "username", message: "New username:" },
        { type: "password", name: "password", message: "New password:" },
    ]);

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`Registration failed: ${res.status} ${errText}`);
            return;
        }

        console.log(chalk.green("Registration successful! You can now log in."));
    } catch (err) {
        console.error("Registration error:", err);
    }
}
