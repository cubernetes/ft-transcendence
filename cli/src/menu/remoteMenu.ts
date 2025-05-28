import chalk from "chalk";
import inquirer from "inquirer";
import { clearToken, getToken, setToken } from "../utils/auth";
import { cleanup } from "../utils/cleanup";
import { API_URL } from "../utils/config";
import { printTitle } from "./mainMenu";

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
                    { name: chalk.magenta("🔗  Join Lobby"), value: "join" },
                    { name: chalk.red("🚪  Logout"), value: "logout" },
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
            case "logout":
                await logout();
                return;
            case "back":
            default:
                return;
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
                { name: chalk.magenta("📝  Register"), value: "register" },
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
        default:
            return;
        // return await mainMenu();
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
                "Content-Type": "application/json",
                Cookie: `token=${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(chalk.red(`Failed to create lobby: ${response.status} - ${errorText}`));
            return;
        }

        const result = await response.json();
        console.log(chalk.green(`✅ Lobby created! Lobby ID: ${result.data.lobbyId}`));
        console.log(chalk.yellow("Share this Lobby ID with others to join the game."));
    } catch (err) {
        console.error(chalk.red("Error creating lobby:"), err);
    }
}

export async function joinLobby(): Promise<void> {
    const { lobbyId } = await inquirer.prompt([
        { type: "input", name: "lobbyId", message: "Enter Lobby ID to join:" },
    ]);

    console.log(chalk.blue("Lobby ID entered:", lobbyId));

    if (!lobbyId || lobbyId.trim() === "") {
        console.error(chalk.red("❌ Invalid Lobby ID. Please try again."));
        return;
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
                "Content-Type": "application/json",
                Cookie: `token=${token}`,
            },
            body: JSON.stringify({}),
        });

        console.log(chalk.blue("Join lobby response status:", response.status));

        if (!response.ok) {
            const errorText = await response.text();
            console.error(chalk.red(`Failed to join lobby: ${response.status} - ${errorText}`));
            return;
        }

        console.log(chalk.green("✅ Successfully joined the lobby!"));
    } catch (err) {
        console.error(chalk.red("Error joining lobby:"), err);
    }
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
            // return promptRemotePlayMenu("Login failed. Please try again.");
            return;
        }

        console.log(chalk.green("✅ Login successful!"));
        await promptRemotePlayMenu(); // Redirect to the remote play menu
        // await promptLobbyMenu(); // Redirect to the lobby menu
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
        console.log(chalk.blue("Attempting login with username:", username));

        const response = await fetch(`${API_URL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        console.log(chalk.blue("Login response status:", response.status));

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

        if (response.ok && result.success) {
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
