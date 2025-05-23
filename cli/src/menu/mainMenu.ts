import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { PongConfig } from "@darrenkuro/pong-core";
import audioManager from "../audio/AudioManager";
import gameManager from "../game/GameManager";
import { cleanup } from "../utils/cleanup";
import { API_URL, GAME_FETCH_ERROR_MSG, MENU_MUSIC } from "../utils/config";
import { optionsMenu } from "./optionsMenu";
import { createLobby, joinLobby, promptRemotePlayMenu } from "./remoteMenu";

let defaultMode = 1;

export async function mainMenu(): Promise<void> {
    try {
        audioManager.startMusic(MENU_MUSIC);
        printTitle("MAIN MENU");
        await promptMainMenu();
    } catch (err) {
        cleanup();
    }
}

export function printTitle(subtitle?: string): void {
    console.clear();
    const title = figlet.textSync(" PONG   CLI", { font: "Small Poison" });
    console.log(chalk.green(title));
    if (subtitle) {
        const sub = figlet.textSync(subtitle, { font: "Soft" });
        console.log(chalk.cyan(sub));
    }
}

async function promptMainMenu(): Promise<void> {
    const { mode } = await inquirer.prompt([
        {
            type: "list",
            name: "mode",
            message: "",
            choices: [
                new inquirer.Separator(),
                { name: chalk.magenta("🏠  Local Game"), value: 1 },
                new inquirer.Separator(),
                { name: chalk.magenta("🌐  Remote Game"), value: 2 },
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
    return handleMenuSelection(mode);
}

async function handleMenuSelection(mode: number): Promise<void> {
    printTitle("LOCAL GAME");
    switch (mode) {
        case 1:
            const { localMode } = await inquirer.prompt([
                {
                    type: "list",
                    name: "localMode",
                    message: "Choose Game Mode:",
                    choices: [
                        new inquirer.Separator(),
                        { name: chalk.magenta("🎮  1P AI Game"), value: "1P" },
                        new inquirer.Separator(),
                        { name: chalk.magenta("👥  2P VS Game"), value: "2P" },
                        new inquirer.Separator(),
                        { name: chalk.red("🔙  Back"), value: "back" },
                    ],
                },
            ]);

            switch (localMode) {
                case "1P":
                    printTitle("1P AI GAME");
                    const { difficulty } = await inquirer.prompt([
                        {
                            type: "list",
                            name: "difficulty",
                            message: "Choose Difficulty:",
                            choices: [
                                new inquirer.Separator(),
                                { name: chalk.green("🟢  Easy"), value: "EASY" },
                                { name: chalk.yellow("🟡  Medium"), value: "MEDIUM" },
                                { name: chalk.red("🔴  Hard"), value: "HARD" },
                                new inquirer.Separator(),
                                { name: chalk.red("🔙 Back"), value: "back" },
                            ],
                        },
                    ]);

                    if (difficulty === "back") {
                        return await handleMenuSelection(1);
                    }

                    gameManager.start1PLocal(difficulty);
                    break;
                case "2P":
                    gameManager.start2PLocal();
                    break;
                case "back":
                default:
                    return await mainMenu();
            }
            break;
        case 2:
            await promptRemotePlayMenu();
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

async function promptLobbyMenu(): Promise<void> {
    printTitle("LOBBY MENU");

    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Lobby Actions:",
            choices: [
                new inquirer.Separator(),
                { name: chalk.magenta("➕  Create Lobby"), value: "create" },
                { name: chalk.magenta("🔗  Join Lobby"), value: "join" },
                { name: chalk.red("🔙  Back"), value: "back" },
            ],
        },
    ]);

    switch (action) {
        case "create":
            await createLobby();
            break;
        case "join":
            await joinLobby();
            break;
        case "back":
        default:
            console.log(chalk.green("Returning to main menu..."));
            await mainMenu();
    }
}
