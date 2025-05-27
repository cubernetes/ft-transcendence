import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import { PongConfig, Size3D } from "@darrenkuro/pong-core";
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
    const displayName = gameManager.getDisplayName?.();
    if (displayName) {
        console.log(chalk.yellowBright(`\tLogged in as: ${chalk.cyanBright.bold(displayName)}`));
    }
    console.log("");
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
                { name: chalk.magenta("⚙️   Options"), value: 3 },
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

                    // const { winPoints: winPoints1P, fieldWidth: fieldWidth1P, fieldHeight: fieldHeight1P } = await inquirer.prompt([
                    const { winPoints: winPoints1P } = await inquirer.prompt([
                        {
                            type: "number",
                            name: "winPoints",
                            message: "Points to win (1-21):",
                            default: 5,
                            validate: (input: number) =>
                                input > 0 && input < 22 ? true : "Enter a number between 1 and 21",
                        },
                        // {
                        //     type: "number",
                        //     name: "fieldWidth",
                        //     message: "Field width (min 20):",
                        //     default: 40,
                        //     validate: (input: number) =>
                        //         input >= 20 ? true : "Minimum width is 20",
                        // },
                        // {
                        //     type: "number",
                        //     name: "fieldHeight",
                        //     message: "Field height (min 10):",
                        //     default: 20,
                        //     validate: (input: number) =>
                        //         input >= 10 ? true : "Minimum height is 10",
                        // },
                    ]);

                    // TODO: Adapt renderer to show different field dimensions!

                    // gameManager.setRenderBoardSize(50, 25);
                    gameManager.start1PLocal({
                        aiMode: true,
                        aiDifficulty: difficulty,
                        playTo: winPoints1P,
                        // board: {
                        // 	size: {
                        // 		width: fieldWidth1P,
                        // 		height: 1,
                        // 		depth: fieldHeight1P
                        // 	} as Size3D,
                        // },
                    });
                    break;
                case "2P":
                    // const { winPoints: winPoints2P, fieldWidth: fieldWidth2P, fieldHeight: fieldHeight2P } = await inquirer.prompt([
                    const { winPoints: winPoints2P } = await inquirer.prompt([
                        {
                            type: "number",
                            name: "winPoints",
                            message: "Points to win (1-21):",
                            default: 5,
                            validate: (input: number) =>
                                input > 0 && input < 22 ? true : "Enter a number between 1 and 21",
                        },
                        // {
                        //     type: "number",
                        //     name: "fieldWidth",
                        //     message: "Field width (min 20):",
                        //     default: 40,
                        //     validate: (input: number) =>
                        //         input >= 20 ? true : "Minimum width is 20",
                        // },
                        // {
                        //     type: "number",
                        //     name: "fieldHeight",
                        //     message: "Field height (min 10):",
                        //     default: 20,
                        //     validate: (input: number) =>
                        //         input >= 10 ? true : "Minimum height is 10",
                        // },
                    ]);

                    gameManager.start2PLocal({
                        aiMode: false,
                        playTo: winPoints2P,
                        // board: {
                        // 	size: {
                        // 		width: fieldWidth2P,
                        // 		height: 1,
                        // 		depth: fieldHeight2P
                        // 	} as Size3D,
                        // },
                    });
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
