import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import { mainMenu } from "./index";

export type PlayStyle = "normal" | "stylish" | "crazy";
export type Resolution = "80x20" | "160x40" | "240x60" | "320x80";

export interface Options {
    music: boolean;
    playStyle: PlayStyle;
    resolution: Resolution;
}

export const userOptions: Options = {
    music: true,
    playStyle: "normal",
    resolution: "160x40",
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
            `${chalk.cyan("\tResolution:")} ${chalk.blueBright(userOptions.resolution)}\n\n`;

        // console.log(`${chalk.cyan("\tMusic:     ")} ${userOptions.music ? chalk.greenBright("Enabled ✓") : chalk.redBright("Disabled ✘")}`);
        // console.log(`${chalk.cyan("\tPlay Style:")} ${chalk.yellowBright(userOptions.playStyle)}`);
        // console.log(`${chalk.cyan("\tResolution:")} ${chalk.blueBright(userOptions.resolution)}\n`);

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

            case "exit":
                exit = true;
                break;
        }
    }
    mainMenu();
}
