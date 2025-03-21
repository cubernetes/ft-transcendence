import inquirer from "inquirer";

export type PlayStyle = "normal" | "stylish" | "crazy";
export interface Options {
    music: boolean;
    volume: number;
    playStyle: PlayStyle;
}
export const userOptions: Options = {
    music: true,
    volume: 70,
    playStyle: "normal",
};
export async function optionsMenu(): Promise<void> {
    const questions = [
        {
            type: "confirm",
            name: "music",
            message: "Enable music?",
            default: userOptions.music,
        },
        {
            type: "input",
            name: "volume",
            message: "Set volume (0–100):",
            default: userOptions.volume.toString(),
            when: (answers: any) => !!answers.music,
            validate: (val: string) => {
                const num = Number(val);
                return isNaN(num) || num < 0 || num > 100
                    ? "Volume must be between 0 and 100"
                    : true;
            },
            filter: (val: string) => Number(val),
        },
        {
            type: "list",
            name: "playStyle",
            message: "Choose play style:",
            choices: ["normal", "stylish", "crazy"],
            default: userOptions.playStyle,
        },
    ];

    // @ts-ignore - Suppressing type errors for inquirer.prompt
    const answers = await inquirer.prompt(questions);

    userOptions.music = answers.music;
    userOptions.volume = answers.volume;
    userOptions.playStyle = answers.playStyle;
    console.log("Updated options:", userOptions);
}
