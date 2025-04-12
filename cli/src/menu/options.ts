import chalk from "chalk";
import figlet from "figlet";
import inquirer from "inquirer";
import audioManager from "../audio/AudioManager";
import { cleanup } from "../utils/cleanup";
import { MENU_MUSIC, userOptions } from "../utils/config";
import { mainMenu } from "./mainMenu";

export async function optionsMenu(): Promise<void> {
    let exit = false;
    let lastChoice = "music";

    while (!exit) {
        try {
            console.clear();

            const title = figlet.textSync(" PONG   CLI", { font: "Small Poison" });
            console.log(chalk.green(title));
            const subtitle = figlet.textSync("OPTIONS", { font: "Soft" });
            console.log(chalk.whiteBright(subtitle));

            const setString =
                `${chalk.cyan("\tMusic:     ")} ${userOptions.music ? chalk.greenBright("Enabled ✓") : chalk.redBright("Disabled ✘")}\n` +
                `${chalk.cyan("\tSounds:    ")} ${userOptions.sfx ? chalk.greenBright("Enabled ✓") : chalk.redBright("Disabled ✘")}\n` +
                `${chalk.cyan("\tPlay Style:")} ${chalk.yellowBright(userOptions.playStyle)}\n` +
                `${chalk.cyan("\tResolution:")} ${chalk.blueBright(userOptions.resolution)}\n` +
                `${chalk.cyan("\tControls:  ")} ${chalk.magenta(`P1  ↑:${userOptions.p1Keys.up}  ↓:${userOptions.p1Keys.down}  ■: ${userOptions.p1Keys.stop}`)} | ` +
                `${chalk.yellow(`P2  ↑:${userOptions.p2Keys.up}  ↓:${userOptions.p2Keys.down}  ■:${userOptions.p2Keys.stop}`)}\n\n`;

            const { option } = await inquirer.prompt([
                {
                    type: "list",
                    name: "option",
                    message: setString,
                    choices: [
                        new inquirer.Separator(),
                        { name: "🎵  Music", value: "music" },
                        new inquirer.Separator(),
                        { name: "💥  Sounds", value: "sfx" },
                        new inquirer.Separator(),
                        { name: "🕹️  Play Style", value: "playStyle" },
                        new inquirer.Separator(),
                        { name: "🖥️  Resolution", value: "resolution" },
                        new inquirer.Separator(),
                        { name: "🎮  Controls", value: "controls" },
                        new inquirer.Separator(),
                        { name: chalk.red("🔙  Back"), value: "exit" },
                    ],
                    default: lastChoice,
                },
            ]);

            audioManager.playSoundEffect("blop");

            lastChoice = option;
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
                            default: userOptions.music,
                        },
                    ]);
                    userOptions.music = music;
                    audioManager.startMusic(MENU_MUSIC);
                    break;
                }

                case "sfx": {
                    const { sfx } = await inquirer.prompt([
                        {
                            type: "list",
                            name: "sfx",
                            message: chalk.magentaBright("Enable Sounds?"),
                            choices: [
                                new inquirer.Separator(),
                                { name: chalk.greenBright("Yes ✓"), value: true },
                                { name: chalk.redBright("No  ✘"), value: false },
                            ],
                            default: userOptions.sfx,
                        },
                    ]);
                    userOptions.sfx = sfx;
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
