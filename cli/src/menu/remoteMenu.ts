import chalk from "chalk";
import inquirer from "inquirer";
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
                message: "Remote Game Options:",
                choices: [
                    new inquirer.Separator(),
                    { name: chalk.magenta("➕  Create Lobby"), value: "create" },
                    new inquirer.Separator(),
                    { name: chalk.magenta("🔗  Join Lobby"), value: "join" },
                    new inquirer.Separator(),
                    { name: chalk.yellow("🔑  Show Saved Token"), value: "show-token" }, // <-- Added
                    new inquirer.Separator(),
                    { name: chalk.red("🚪  Logout"), value: "logout" },
                    new inquirer.Separator(),
                    { name: chalk.red("🔙  Back"), value: "back" },
                ],
            },
        ]);

        switch (action) {
            case "create":
                await createLobby();
                return; // promptRemotePlayMenu();
            case "join":
                await joinLobby();
                return promptRemotePlayMenu();
            case "show-token":
                console.log(chalk.yellowBright("\nSaved Token:\n"));
                console.log(token ? chalk.white(token) : chalk.red("No token saved."));
                await inquirer.prompt([
                    { type: "input", name: "continue", message: "Press Enter to continue..." },
                ]);
                return promptRemotePlayMenu();
            case "logout":
                await logout();
                return promptRemotePlayMenu();
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
        const lobbyId = result.data.lobbyId;
        console.log(chalk.green(`✅ Lobby created! Lobby ID: ${lobbyId}`));
        console.log(chalk.yellow("Share this Lobby ID with others to join the game."));

        await lobbyOwnerMenu(lobbyId);
    } catch (err) {
        console.error(chalk.red("Error creating lobby:"), err);
    }
}

async function lobbyOwnerMenu(lobbyId: string) {
    const wsManager = gameManager.getWSManager();

    async function showMenu() {
        while (true) {
            printTitle("LOBBY MENU");
            const lobbyUpdate = gameManager.getRemoteConfig();
            showLobbyUpdate(lobbyUpdate);

            const { action } = await inquirer.prompt([
                {
                    type: "list",
                    name: "action",
                    message: `Lobby ${chalk.yellowBright.bold(lobbyId)} - What would you like to do?`,
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

            if (action === "settings") {
                console.log(chalk.yellow("⚙️  Settings adjustment not implemented yet."));
                // TODO: Settings logic here
            } else if (action === "start") {
                console.log(chalk.green("🚀 Starting the game..."));
                // TODO: Start game logic here
                await gameManager.start1PRemote();
                break;
            } else if (action === "leave") {
                const token = getToken();
                await fetch(`${API_URL}/lobby/leave`, {
                    method: "POST",
                    headers: {
                        Cookie: `token=${token}`,
                    },
                });
                break;
            }
        }
    }

    function onLobbyUpdate() {
        showMenu();
    }

    wsManager.on("lobby-update", onLobbyUpdate);

    await showMenu();

    wsManager.off("lobby-update", onLobbyUpdate);
}

export async function joinLobby(): Promise<void> {
    // Internal helper for retry/back prompt
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
        const { lobbyId } = await inquirer.prompt([
            { type: "input", name: "lobbyId", message: "Enter Lobby ID to join:" },
        ]);

        if (!lobbyId || lobbyId.trim().length !== 6) {
            const retry = await promptRetryOrBack("❌ Invalid Lobby ID. It must be 6 characters.");
            if (!retry) return;
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
                        await gameManager.join1PRemote();
                        return;
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

            printTitle("GAME LOBBY");
            console.log(chalk.green("✅ Successfully joined the lobby!"));
            console.log(chalk.yellow("Waiting for the host to start the game..."));
            await gameManager.join1PRemote();
            return;
        } catch (err) {
            const retry = await promptRetryOrBack(`Error joining lobby: ${err}`);
            if (!retry) return;
        }
    }
}

export async function askLobbyLeave(): Promise<void> {
    printTitle("WAITING ...");
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

    promptRemotePlayMenu("You have left the lobby.");
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

        // console.log(chalk.green("✅ Login successful!"));
        gameManager.setWSActive(true);
        await promptRemotePlayMenu();
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
}

async function loginToServer(username: string, password: string): Promise<boolean> {
    try {
        // console.log(chalk.blue("Attempting login with username:", username));

        const response = await fetch(`${API_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        // console.log(chalk.blue("Login response status:", response.status));

        if (!response.ok) {
            const errorText = await response.text();
            console.error(chalk.red(`❌ Login failed: ${response.status} - ${errorText}`));
            return false;
        }

        // Extract the token from the set-cookie header
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
