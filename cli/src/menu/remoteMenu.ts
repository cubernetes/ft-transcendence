import chalk from "chalk";
import { on } from "events";
import inquirer from "inquirer";
import readline from "readline";
import gameManager from "../game/GameManager";
import { clearToken, getToken, setToken } from "../utils/auth";
import { cleanup } from "../utils/cleanup";
import { API_URL } from "../utils/config";
import { showLobbyUpdate } from "../utils/div";
import { mainMenu, printTitle } from "./mainMenu";

export async function promptRemotePlayMenu(errorMsg?: string): Promise<void> {
    printTitle("REMOTE GAME");
    const token = getToken();

    if (token) {
        const { action } = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: errorMsg ? chalk.red(errorMsg) : "Remote Game Options:",
                choices: [
                    new inquirer.Separator(),
                    { name: chalk.magenta("➕  Create Lobby"), value: "create" },
                    new inquirer.Separator(),
                    { name: chalk.magenta("🔗  Join Lobby"), value: "join" },
                    new inquirer.Separator(),
                    { name: chalk.yellow("🔑  Show Saved Token"), value: "show-token" },
                    new inquirer.Separator(),
                    { name: chalk.red("🚪  Logout"), value: "logout" },
                    new inquirer.Separator(),
                    { name: chalk.red("🔙  Back"), value: "back" },
                ],
            },
        ]);

        switch (action) {
            case "create":
                return createLobby();
            case "join":
                return joinLobby();
            case "show-token":
                console.log(chalk.yellowBright("\nSaved Token:\n"));
                console.log(token ? chalk.white(token) : chalk.red("No token saved."));
                await inquirer.prompt([
                    { type: "input", name: "continue", message: "Press Enter to continue..." },
                ]);
                return promptRemotePlayMenu();
            case "logout":
                return logout();
            case "back":
            default:
                return mainMenu();
        }
    }

    const { action } = await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: errorMsg ? chalk.red(errorMsg) : "Login / Register:",
            choices: [
                new inquirer.Separator(),
                { name: chalk.magenta("🔐  Login"), value: "login" },
                new inquirer.Separator(),
                { name: chalk.magenta("📝  Register"), value: "register" },
                new inquirer.Separator(),
                { name: chalk.red("🔙  Back"), value: "back" },
            ],
        },
    ]);

    switch (action) {
        case "login":
            await handleServerLogin();
            break;
        case "register":
            if (await registerUser()) return await handleServerLogin();
            else return await promptRemotePlayMenu("Registration failed. Please try again.");
        case "back":
            return mainMenu();
        default:
            return mainMenu();
    }
}

export async function createLobby(): Promise<void> {
    try {
        const token = getToken();
        if (!token) {
            console.error(chalk.red("❌ No token found. Please log in again."));
            return;
        }

        const response = await fetch(`${API_URL}/lobby/create`, {
            method: "POST",
            headers: {
                Cookie: `token=${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();

            if (response.status === 409 && errorText.includes("ALREADY_IN_LOBBY")) {
                await fetch(`${API_URL}/lobby/leave`, {
                    method: "POST",
                    headers: {
                        Cookie: `token=${token}`,
                    },
                });
                return createLobby();
            }

            console.error(chalk.red(`Failed to create lobby: ${response.status} - ${errorText}`));
            return;
        }

        const result = await response.json();
        gameManager.setCurrentLobbyId(result.data.lobbyId);
        gameManager.setWSActive(true);
        console.log(chalk.green(`✅ Lobby created! Lobby ID: ${result.data.lobbyId}`));
        console.log(chalk.yellow("Share this Lobby ID with others to join the game."));

        return lobbyOwnerMenu(result.data.lobbyId);
    } catch (err) {
        console.error(chalk.red("Error creating lobby:"), err);
    }
}

async function lobbyOwnerMenu(lobbyId: string) {
    const wsManager = gameManager.getWSManager();
    let latestLobbyUpdate: any = null;
    let promptMsg = `Lobby ${chalk.yellowBright.bold(lobbyId)} - What would you like to do?`;

    function onLobbyUpdate() {
        latestLobbyUpdate = gameManager.getRemoteConfig();
        showLobbyUpdate(latestLobbyUpdate);
        readline.cursorTo(process.stdout, 0, 27);
    }

    wsManager.on("lobby-update", onLobbyUpdate);

    try {
        printTitle("LOBBY MENU");
        latestLobbyUpdate = gameManager.getRemoteConfig();
        showLobbyUpdate(latestLobbyUpdate);

        while (true) {
            readline.cursorTo(process.stdout, 0, 21);
            readline.clearLine(process.stdout, 0);
            const { action } = await inquirer.prompt([
                {
                    type: "list",
                    name: "action",
                    message: promptMsg,
                    choices: [
                        new inquirer.Separator(),
                        { name: chalk.magenta("⚙️  Adjust Settings"), value: "settings" },
                        new inquirer.Separator(),
                        { name: chalk.magenta("🚀  Start Game"), value: "start" },
                        new inquirer.Separator(),
                        { name: chalk.red("🚪  Leave Lobby"), value: "leave" },
                    ],
                },
            ]);

            promptMsg = `Lobby ${chalk.yellowBright.bold(lobbyId)} - What would you like to do?`;

            if (action === "settings") {
                await lobbySettingsMenu(latestLobbyUpdate);
                readline.cursorTo(process.stdout, 0, 22);
                readline.clearLine(process.stdout, 0);
            } else if (action === "start") {
                latestLobbyUpdate = gameManager.getRemoteConfig();
                const playerNames: string[] = latestLobbyUpdate?.playerNames || [];
                if (playerNames.length < 2 || !playerNames[0] || !playerNames[1]) {
                    promptMsg = `Lobby ${chalk.yellowBright.bold(lobbyId)} -  🚫 ${chalk.red.italic("You need two players in the lobby to start the game!")}`;
                    continue;
                }
                return gameManager.start1PRemote();
            } else if (action === "leave") {
                const token = getToken();
                await fetch(`${API_URL}/lobby/leave`, {
                    method: "POST",
                    headers: {
                        Cookie: `token=${token}`,
                    },
                });
                wsManager.off("lobby-update", onLobbyUpdate);
                gameManager.setCurrentLobbyId(null);
                gameManager.setWSActive(false);
                return promptRemotePlayMenu("You have left the lobby.");
            }
            showLobbyUpdate(latestLobbyUpdate);
        }
    } catch (err) {
        return promptRemotePlayMenu("An error occurred in the lobby. Returning to menu.");
    } finally {
        wsManager.off("lobby-update", onLobbyUpdate);
    }
}

async function lobbySettingsMenu(latestLobbyUpdate: any) {
    let config = latestLobbyUpdate?.config || {};
    let currentWinPoints = config.playTo || 5;

    const { winPoints } = await inquirer.prompt([
        {
            type: "number",
            name: "winPoints",
            message: `Set Win Points (current: ${currentWinPoints}):`,
            default: currentWinPoints,
            validate: (input: number) =>
                input > 0 && input < 22 ? true : "Enter a number between 1 and 21",
        },
    ]);

    const token = getToken();
    await fetch(`${API_URL}/lobby/update`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: `token=${token}`,
        },
        body: JSON.stringify({
            playTo: winPoints,
        }),
    });
}

export async function joinLobby(): Promise<void> {
    async function promptRetryOrBack(message: string): Promise<boolean> {
        console.error(chalk.red(message));
        const { action } = await inquirer.prompt([
            {
                type: "list",
                name: "action",
                message: "What would you like to do?",
                choices: [
                    { name: "Try again", value: "retry" },
                    { name: "Back", value: "back" },
                ],
            },
        ]);
        return action === "retry";
    }

    while (true) {
        printTitle("GAME LOBBY");
        let lobbyId = "";

        const response = await inquirer.prompt([
            {
                type: "input",
                name: "lobbyId",
                message: "Enter Lobby ID to join:",
            },
        ]);
        lobbyId = response.lobbyId;

        if (!lobbyId || lobbyId.trim().length !== 6) {
            const retry = await promptRetryOrBack("❌ Invalid Lobby ID. It must be 6 characters.");
            if (!retry) return promptRemotePlayMenu("Lobby join cancelled.");
            continue;
        }

        try {
            const token = getToken();

            if (!token) {
                console.error(chalk.red("❌ No token found. Please log in again."));
                return;
            }

            const response = await fetch(`${API_URL}/lobby/join/${lobbyId}`, {
                method: "POST",
                headers: {
                    Cookie: `token=${token}`,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 404 && errorText.includes("NOT_FOUND")) {
                    const retry = await promptRetryOrBack(
                        "❌ Lobby not found. Please check the Lobby ID and try again."
                    );
                    if (!retry) return;
                    continue;
                } else if (response.status === 409 && errorText.includes("ALREADY_IN_LOBBY")) {
                    printTitle("GAME LOBBY");
                    console.error(chalk.red("✅ You are already in a lobby."));
                    const { action } = await inquirer.prompt([
                        {
                            type: "list",
                            name: "action",
                            message: "You are already in a lobby. What would you like to do?",
                            choices: [
                                { name: "Leave current lobby and try again", value: "leave" },
                                { name: "Join current lobby", value: "join" },
                                { name: "Back", value: "back" },
                            ],
                        },
                    ]);
                    if (action === "leave") {
                        await fetch(`${API_URL}/lobby/leave`, {
                            method: "POST",
                            headers: {
                                Cookie: `token=${token}`,
                            },
                        });

                        console.log(chalk.green("✅ Left the previous lobby."));
                        continue;
                    } else if (action === "join") {
                        return gameManager.join1PRemote();
                    } else {
                        return;
                    }
                } else {
                    const retry = await promptRetryOrBack(
                        `Failed to join lobby: ${response.status} - ${errorText}`
                    );
                    if (!retry) return;
                    continue;
                }
            }

            const wsManager = gameManager.getWSManager();
            gameManager.setCurrentLobbyId(lobbyId);
            gameManager.setWSActive(true);
            let latestLobbyUpdate: any = null;

            function onLobbyUpdate() {
                latestLobbyUpdate = gameManager.getRemoteConfig();
                showLobbyUpdate(latestLobbyUpdate);
                readline.cursorTo(process.stdout, 0, 27);
            }
            function onGameStart() {
                wsManager.off("lobby-update", onLobbyUpdate);
                wsManager.off("lobby-remove", onLobbyRemove);
                return gameManager.join1PRemote();
            }
            function onLobbyRemove() {
                gameManager.setCurrentLobbyId(null);
                gameManager.setWSActive(false);
                wsManager.off("lobby-update", onLobbyUpdate);
                wsManager.off("game-start", onGameStart);
                wsManager.off("lobby-remove", onLobbyRemove);
                return promptRemotePlayMenu("You have been removed from the lobby.");
            }

            wsManager.on("lobby-update", onLobbyUpdate);
            wsManager.once("game-start", onGameStart);
            wsManager.once("lobby-remove", onLobbyRemove);

            printTitle("LOBBY JOINED");
            latestLobbyUpdate = gameManager.getRemoteConfig();
            showLobbyUpdate(latestLobbyUpdate);

            while (true) {
                readline.cursorTo(process.stdout, 0, 21);
                const { action } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "action",
                        message: "Waiting for host... What would you like to do?",
                        choices: [{ name: chalk.red("🚪  Leave Lobby"), value: "leave" }],
                    },
                ]);
                if (action === "leave") {
                    await fetch(`${API_URL}/lobby/leave`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Cookie: `token=${token}`,
                        },
                    });
                    gameManager.setCurrentLobbyId(null);
                    wsManager.off("lobby-update", onLobbyUpdate);
                    wsManager.off("game-start", onGameStart);
                    wsManager.off("lobby-remove", onLobbyRemove);
                    return promptRemotePlayMenu("You have left the lobby.");
                }
            }
        } catch (err) {
            const retry = await promptRetryOrBack(`Error joining lobby: ${err}`);
            if (!retry) return;
        }
    }
}

export async function askLobbyLeave(lobbyId: string): Promise<void> {
    printTitle("WAITING ...");
    console.log(`You are in lobby: ${chalk.yellowBright.bold(lobbyId)}`);

    const lobbyUpdate = gameManager.getRemoteConfig?.() || {};
    if (lobbyUpdate) {
        showLobbyUpdate(lobbyUpdate);
    }
    console.log("Waiting for the host to start the game...");
    await inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "... or would you like to leave?",
            choices: [{ name: chalk.red("Leave Lobby"), value: 0 }],
        },
    ]);

    const token = getToken();
    await fetch(`${API_URL}/lobby/leave`, {
        method: "POST",
        headers: {
            Cookie: `token=${token}`,
        },
    });

    return;
}

export async function handleServerLogin(): Promise<void> {
    try {
        console.log(" ");
        const { username, password } = await inquirer.prompt([
            { type: "input", name: "username", message: "Username:" },
            { type: "password", name: "password", message: "Password:" },
        ]);

        const success = await loginToServer(username, password);

        if (!success) {
            return promptRemotePlayMenu("Login failed. Please try again.");
        }

        gameManager.setWSActive(true);
        return promptRemotePlayMenu();
    } catch (err: any) {
        if (err?.isTtyError || err?.constructor?.name === "ExitPromptError") {
            cleanup();
        } else {
            console.error(chalk.red("Error during login process."), err);
            cleanup("Login process failed.");
        }
    }
}

export async function logout(): Promise<void> {
    clearToken();
    console.log(chalk.green("✅ Logged out successfully."));
    return promptRemotePlayMenu();
}

async function loginToServer(username: string, password: string): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(chalk.red(`❌ Login failed: ${response.status} - ${errorText}`));
            return false;
        }

        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
            const tokenMatch = setCookieHeader.match(/token=([^;]+)/);
            if (tokenMatch) {
                const token = tokenMatch[1];
                setToken(token); // Store the token using auth.ts
                console.log(chalk.green("✅ Token stored successfully:", token));
            } else {
                console.error(chalk.red("❌ Token not found in set-cookie header."));
            }
        } else {
            console.error(chalk.red("❌ No set-cookie header received."));
        }

        const result = await response.json();

        if (result.success) {
            console.log(chalk.green("✅ Login successful! Welcome,", result.data.displayName));
            return true;
        } else {
            console.error(chalk.red("❌ Login failed:", result.error?.message || "Unknown error"));
            return false;
        }
    } catch (err) {
        console.error(chalk.red("Login error:", err));
        return false;
    }
}

async function registerUser(): Promise<boolean> {
    console.log(" ");
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
