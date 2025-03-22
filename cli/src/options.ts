import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { mainMenu } from "./index";

export type PlayStyle = "normal" | "stylish" | "crazy";
export type Resolution = "80x20" | "160x40" | "240x60" | "320x80";

export interface PlayerControls {
    player1Up: string;
    player1Down: string;
    player2Up: string;
    player2Down: string;
}

export interface Options {
    music: boolean;
    playStyle: PlayStyle;
    resolution: Resolution;
    playerControls: PlayerControls;
}

export const userOptions: Options = {
    music: true,
    playStyle: "normal",
    resolution: "160x40",
    playerControls: { player1Up: "w", player1Down: "s", player2Up: "i", player2Down: "k" },
};

export async function optionsMenu(): Promise<void> {
    let exit = false;

    while (!exit) {
        console.clear();

        const title = figlet.textSync(" PONG   CLI", { font: "Small Poison" });
        console.log(chalk.green(title));
        const subtitle = figlet.textSync("  OPTIONS", { font: "Soft" });
        console.log(chalk.whiteBright(subtitle));

        const setString =
            `${chalk.cyan("\tMusic:     ")} ${userOptions.music ? chalk.greenBright("Enabled ✓") : chalk.redBright("Disabled ✘")}\n` +
            `${chalk.cyan("\tPlay Style:")} ${chalk.yellowBright(userOptions.playStyle)}\n` +
            `${chalk.cyan("\tResolution:")} ${chalk.blueBright(userOptions.resolution)}\n` +
            `${chalk.cyan("\tControls:  ")} ${chalk.magenta(`P1: ↑ ${userOptions.playerControls.player1Up} ↓ ${userOptions.playerControls.player1Down}`)} | ` +
            `${chalk.yellow(`P2: ↑ ${userOptions.playerControls.player2Up} ↓ ${userOptions.playerControls.player2Down}`)}\n\n`;

        const { option } = await inquirer.prompt([
            {
                type: "list",
                name: "option",
                message: setString,
                // message: chalk.cyan("Select an option to change:"),
                choices: [
                    new inquirer.Separator(),
                    { name: "🎵 Music", value: "music" },
                    new inquirer.Separator(),
                    { name: "🎮 Play Style", value: "playStyle" },
                    new inquirer.Separator(),
                    { name: "🖥️ Resolution", value: "resolution" },
                    new inquirer.Separator(),
                    { name: "⏳ Player Controls", value: "controls" },
                    new inquirer.Separator(),
                    { name: chalk.red("⬅  Main menu"), value: "exit" },
                ],
            },
        ]);

        switch (option) {
            case "music": {
                const { music } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "music",
                        message: chalk.magentaBright("Enable music?"),
                        choices: [
                            new inquirer.Separator(),
                            { name: chalk.greenBright("Yes ✓"), value: true },
                            { name: chalk.redBright("No  ✘"), value: false },
                        ],
                        default: userOptions.playStyle,
                    },
                ]);
                userOptions.music = music;
                break;
            }

            case "playStyle": {
                const { playStyle } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "playStyle",
                        message: "",
                        choices: [
                            new inquirer.Separator(),
                            { name: "🎯 Normal", value: "normal" },
                            { name: "💃 Stylish", value: "stylish" },
                            { name: "🤪 Crazy", value: "crazy" },
                        ],
                        default: userOptions.playStyle,
                    },
                ]);
                userOptions.playStyle = playStyle;
                break;
            }

            case "resolution": {
                const { resolution } = await inquirer.prompt([
                    {
                        type: "list",
                        name: "resolution",
                        message: chalk.magentaBright("Select resolution:"),
                        choices: [
                            new inquirer.Separator(),
                            { name: " 80x20 (Compact)", value: "80x20" },
                            { name: "160x40 (Balanced)", value: "160x40" },
                            { name: "240x60 (Spacious)", value: "240x60" },
                            { name: "320x80 (Large)", value: "320x80" },
                        ],
                        default: userOptions.resolution,
                    },
                ]);
                userOptions.resolution = resolution;
                break;
            }

            case "controls": {
                const { player1Up, player1Down, player2Up, player2Down } = await inquirer.prompt([
                    {
                        type: "input",
                        name: "player1Up",
                        message: chalk.cyan("Set Player 1   UP: ↑"),
                        default: "w",
                    },
                    {
                        type: "input",
                        name: "player1Down",
                        message: chalk.cyan("Set Player 1 DOWN: ↓"),
                        default: "s",
                    },
                    {
                        type: "input",
                        name: "player2Up",
                        message: chalk.cyan("Set Player 2   UP: ↑"),
                        default: "i",
                    },
                    {
                        type: "input",
                        name: "player2Down",
                        message: chalk.cyan("Set Player 2 DOWN: ↓"),
                        default: "k",
                    },
                ]);
                userOptions.playerControls = { player1Up, player1Down, player2Up, player2Down };
                break;
            }

            case "exit":
                exit = true;
                break;
        }
    }
    mainMenu();
}
