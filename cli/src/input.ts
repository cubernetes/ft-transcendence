import readline from "readline";
import { setGameActive, mainMenu } from "./index";
import { audioManager } from "./audio";
import { userOptions } from "./options";

// Function to start listening for key presses
export function startKeyListener(onDir: (d: "up" | "down" | "stop") => void) {
    let upPressed = false;
    let downPressed = false;

    if (userOptions.music) {
        audioManager.startMusic();
    }

    // Create an interface to read from stdin
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false, // Don't display input on the terminal
    });

    // Enable raw mode to capture keypresses directly
    process.stdin.setRawMode(true);
    process.stdin.resume();

    // Define the key listener
    const keyListener = (key: Buffer) => {
        const keyName = key.toString();

        // Up direction: Arrow up or User-defined key
        if ((keyName === "\u001b[A" || keyName === userOptions.controls.p1Up) && !upPressed) {
            upPressed = true;
            downPressed = false;
            onDir("down");
        }
        // Down direction: Arrow down or User-defined key
        else if (
            (keyName === "\u001b[B" || keyName === userOptions.controls.p1Down) &&
            !downPressed
        ) {
            downPressed = true;
            upPressed = false;
            onDir("up");
        }
        // Stop: Space or User-defined key
        else if (keyName === " " || keyName === userOptions.controls.p1Stop) {
            downPressed = false;
            upPressed = false;
            onDir("stop");
        }

        // Exit the game with Ctrl+C
        else if (keyName === "\u0003") {
            // cleanup:
            audioManager.stopMusic();
            process.stdin.removeListener("data", keyListener);
            process.exit(); // hard exit
        }

        // ESC
        else if (keyName === "\u001b") {
            console.log("Exiting game... Returning to menu.");

            // Stop the key listener
            process.stdin.removeListener("data", keyListener);

            // Set isGameActive to false and return to menu
            setGameActive(false);

            audioManager.stopMusic();
            mainMenu();
        }
    };
    // Start listening for keypress events
    process.stdin.on("data", keyListener);
}
