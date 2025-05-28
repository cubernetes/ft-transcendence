import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { PongConfig } from "@darrenkuro/pong-core";
import audioManager from "../audio/AudioManager";
import gameManager from "../game/GameManager";
import { getToken, setToken } from "../utils/auth";
import { cleanup } from "../utils/cleanup";
import { API_URL, GAME_FETCH_ERROR_MSG, MENU_MUSIC } from "../utils/config";
import { optionsMenu } from "./options";

let defaultMode = 1;

export async function mainMenu(): Promise<void> {
    try {
        audioManager.startMusic(MENU_MUSIC);
        printTitle();
        const mode = await promptMainMenu();
        await handleMenuSelection(mode);
    } catch (err) {
        cleanup();
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
            message: figlet.textSync("MAIN MENU\n", { font: "Soft" }),
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
    return mode;
}

async function handleMenuSelection(mode: number): Promise<void> {
    printTitle();
    switch (mode) {
        case 1:
            const { localMode } = await inquirer.prompt([
                {
                    type: "list",
                    name: "localMode",
                    message: figlet.textSync("LOCAL GAME\n", { font: "Soft" }),
                    choices: [
                        new inquirer.Separator(),
                        { name: chalk.magenta("🎮  1P Game"), value: "1P" },
                        new inquirer.Separator(),
                        { name: chalk.magenta("👥  2P Game"), value: "2P" },
                        new inquirer.Separator(),
                        { name: chalk.red("🔙  Back"), value: "back" },
                    ],
                },
            ]);

            switch (localMode) {
                case "1P":
                    gameManager.start1PLocal();
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

async function promptRemotePlayMenu(): Promise<void> {
    printTitle();
    const token = getToken();

    if (token) {
        // Optional: add a ping or token validation call to check if token is still valid
        return gameManager.start1PRemote();
    }

    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: figlet.textSync("REMOTE GAME", { font: "Soft" }),
            choices: [
                new inquirer.Separator(),
                { name: chalk.magenta("🔐 Login"), value: "login" },
                new inquirer.Separator(),
                { name: chalk.magenta("📝 Register"), value: "register" },
                new inquirer.Separator(),
                { name: chalk.red("🔙 Back"), value: "back" },
            ],
        },
    ]);

    switch (action) {
        case "login":
            await handleServerLogin();
            break;
        case "register":
            await registerUser();
            return await handleServerLogin(); // or return to promptRemotePlayMenu
        case "back":
        default:
            return await mainMenu();
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
            printTitle();
            const { action } = await inquirer.prompt([
                {
                    type: "list",
                    name: "action",
                    message: "Login failed. What do you want to do?",
                    choices: [
                        new inquirer.Separator(),
                        { name: chalk.magenta("Try again"), value: "retry" },
                        new inquirer.Separator(),
                        { name: chalk.magenta("Register new account"), value: "register" },
                        new inquirer.Separator(),
                        { name: chalk.red("Back to Menu"), value: "back" },
                    ],
                },
            ]);

            switch (action) {
                case "retry":
                    return await handleServerLogin();
                case "register":
                    if (await registerUser()) return await handleServerLogin();
                    else return await promptRemotePlayMenu();
                case "back":
                default:
                    return await mainMenu();
            }
        }

        setToken(token);
        gameManager.start1PRemote();
    } catch (err) {
        console.error(chalk.red("Error during login process."), err);
        cleanup("Login process failed.");
    }
}

async function loginToServer(username: string, password: string): Promise<string | null> {
    try {
        const response = await fetch(`${API_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            // Handle non-200 HTTP responses (e.g., 4xx or 5xx errors)
            console.error(chalk.red(`Login failed with status: ${response.status}`));
            return null;
        }

        const result = await response.json();
        return result.data.token;
    } catch (err) {
        // console.error(chalk.red("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"));
        // Handle network-related errors (e.g., ECONNREFUSED)
        if (err.code === "ECONNREFUSED") {
            console.error(chalk.red("Connection refused. Please ensure the server is running."));
        } else {
            console.error(chalk.red("Login error:", err));
        }
        return null;
    }
}

async function registerUser(): Promise<boolean> {
    const { username, password, displayName, confirmPassword } = await inquirer.prompt([
        { type: "input", name: "username", message: "New username: " },
        { type: "password", name: "password", message: "New password: " },
        { type: "input", name: "displayName", message: "Displayed Name: " },
        { type: "password", name: "confirmPassword", message: "Confirm Password: " },
    ]);

    const data = {
        username: username,
        password: password,
        displayName: displayName,
        confirmPassword: confirmPassword,
    };

    try {
        const res = await fetch(`${API_URL}/user/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errText = "Unknown error";
            console.log(chalk.red(`❌ Registration failed: ${res.status} ${errText}`));
            return false;
        }

        console.log(chalk.green("✅ Registration successful! You can now log in."));
        return true;
    } catch (err) {
        console.error(chalk.red("⚠️ Registration error:"), err);
        return false;
    }
}
