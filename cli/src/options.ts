import inquirer from "inquirer";
import chalk from "chalk";
import { mainMenu } from "./index";

export type PlayStyle = "normal" | "stylish" | "crazy";
export interface Options {
    music: boolean;
    playStyle: PlayStyle;
}

export const userOptions: Options = {
    music: true,
    playStyle: "normal",
};

export async function optionsMenu(): Promise<void> {
    console.clear();
    console.log(chalk.green.bold("OPTIONS MENU\n"));

    const questions = [
        {
            type: "confirm",
            name: "music",
            message: chalk.cyan("Enable music?"),
            default: userOptions.music,
        },
        {
            type: "list",
            name: "playStyle",
            message: chalk.cyan("Choose play style:"),
            choices: [
                { name: chalk.yellow("🎯 Normal"), value: "normal" },
                { name: chalk.magenta("💃 Stylish"), value: "stylish" },
                { name: chalk.redBright("🤪 Crazy"), value: "crazy" },
            ],
            default: userOptions.playStyle,
            when: (answers: any) => answers.music,
        },
    ];

    // @ts-ignore - Suppressing type errors for inquirer.prompt
    const answers = await inquirer.prompt(questions);

    userOptions.music = answers.music;
    if (userOptions.music) {
        userOptions.playStyle = answers.playStyle;
    }

    console.log(chalk.green("\nSettings updated!\n"));
    mainMenu();
}
