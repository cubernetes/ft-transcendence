import chalk from "chalk";
import inquirer from "inquirer";
import audioManager from "../audio/AudioManager";
import { cleanup } from "../utils/cleanup";
import { MENU_MUSIC, userOptions } from "../utils/config";
import { mainMenu, printTitle } from "./mainMenu";

export async function optionsMenu(): Promise<void> {
    let exit = false;
    let lastChoice = "music";

    while (!exit) {
        try {
            printTitle("OPTIONS");

            const setString =
                `${chalk.cyan("\tMusic:     ")} ${userOptions.music ? chalk.greenBright("Enabled ✓") : chalk.redBright("Disabled ✘")}\n` +
                `${chalk.cyan("\tSounds:    ")} ${userOptions.sfx ? chalk.greenBright("Enabled ✓") : chalk.redBright("Disabled ✘")}\n` +
                `${chalk.cyan("\tPlay Style:")} ${chalk.yellowBright(userOptions.playStyle)}\n` +
                `${chalk.cyan("\tResolution:")} ${chalk.blueBright(userOptions.resolution)}\n` +
                `${chalk.cyan("\tControls:  ")} ${chalk.magenta(`P1:  ↑ ${userOptions.p1Keys.up}   ↓ ${userOptions.p1Keys.down}   ■ ${userOptions.p1Keys.stop}`)}` +
                `${chalk.yellow(`\n\t            P2:  ↑ ${userOptions.p2Keys.up}   ↓ ${userOptions.p2Keys.down}   ■ ${userOptions.p2Keys.stop}`)}\n\n`;

            const { option } = await inquirer.prompt([
                {
                    type: "list",
                    name: "option",
                    message: setString,
                    choices: [
                        new inquirer.Separator(),
                        { name: chalk.magenta("🔊  Audio"), value: "audio" },
                        new inquirer.Separator(),
                        { name: chalk.magenta("🕹️  Play Style"), value: "playStyle" },
                        new inquirer.Separator(),
                        { name: chalk.magenta("🖥️  Resolution"), value: "resolution" },
                        new inquirer.Separator(),
                        { name: chalk.magenta("🎮  Controls"), value: "controls" },
                        new inquirer.Separator(),
                        { name: chalk.red("🔙  Back"), value: "exit" },
                    ],
                    default: lastChoice,
                },
            ]);

            audioManager.playSoundEffect("blop");

            lastChoice = option;
            switch (option) {
                case "audio": {
                    // Combine music and sfx toggles into one checkbox menu
                    const { toggles } = await inquirer.prompt([
                        {
                            type: "checkbox",
                            name: "toggles",
                            message: "",
                            choices: [
                                new inquirer.Separator(),
                                {
                                    name: chalk.greenBright("🎵 Music"),
                                    value: "music",
                                    checked: userOptions.music,
                                },
                                new inquirer.Separator(" "),
                                {
                                    name: chalk.greenBright("💥 Sounds"),
                                    value: "sfx",
                                    checked: userOptions.sfx,
                                },
                            ],
                        },
                    ]);
                    userOptions.music = toggles.includes("music");
                    audioManager.startMusic(MENU_MUSIC);
                    userOptions.sfx = toggles.includes("sfx");
                    if (userOptions.music) audioManager.startMusic(MENU_MUSIC);
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
                    const usedKeys = new Set<string>();

                    const askKey = async (
                        message: string,
                        defaultValue: string
                    ): Promise<string> => {
                        const { key } = await inquirer.prompt([
                            {
                                type: "input",
                                name: "key",
                                message,
                                default: defaultValue,
                                validate: (input: string) => {
                                    input = input.trim().toLowerCase();
                                    if (input.length !== 1)
                                        return "Key must be a single character.";
                                    if (usedKeys.has(input))
                                        return `Key '${input}' is already used.`;
                                    return true;
                                },
                                filter: (input: string) => input.trim().toLowerCase(),
                            },
                        ]);
                        usedKeys.add(key);
                        return key;
                    };
                    userOptions.p1Keys.up = await askKey(
                        chalk.cyan("Set Player 1   UP: ↑"),
                        userOptions.p1Keys.up
                    );
                    userOptions.p1Keys.down = await askKey(
                        chalk.cyan("Set Player 1 DOWN: ↓"),
                        userOptions.p1Keys.down
                    );
                    userOptions.p1Keys.stop = await askKey(
                        chalk.cyan("Set Player 1 STOP: ■"),
                        userOptions.p1Keys.stop
                    );
                    userOptions.p2Keys.up = await askKey(
                        chalk.cyan("Set Player 2   UP: ↑"),
                        userOptions.p2Keys.up
                    );
                    userOptions.p2Keys.down = await askKey(
                        chalk.cyan("Set Player 2 DOWN: ↓"),
                        userOptions.p2Keys.down
                    );
                    userOptions.p2Keys.stop = await askKey(
                        chalk.cyan("Set Player 2 STOP: ■"),
                        userOptions.p2Keys.stop
                    );

                    break;
                }

                case "exit":
                    exit = true;
                    break;
            }
        } catch (err) {
            cleanup();
        }
    }
    mainMenu();
}
