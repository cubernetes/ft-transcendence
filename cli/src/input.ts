import readline from 'readline';
import { setGameActive, getGameActive, mainMenu } from './index';

// Function to start listening for key presses
export function startKeyListener(onDir: (d: "up" | "down" | "stop") => void) {
  let upPressed = false;
  let downPressed = false;

  // Create an interface to read from stdin
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false // Don't display input on the terminal
  });

  // Enable raw mode to capture keypresses directly
  process.stdin.setRawMode(true);
  process.stdin.resume();

  // Define the key listener
  const keyListener = (key: Buffer) => {
    const keyName = key.toString();

    // Up direction: Arrow up or 'w'
    if ((keyName === '\u001b[A' || keyName === 'w') && !upPressed) {
      upPressed = true;
      downPressed = false;
      onDir('down');
    }
    // Down direction: Arrow down or 's'
    else if ((keyName === '\u001b[B' || keyName === 's') && !downPressed) {
      downPressed = true;
      upPressed = false;
      onDir('up');
    }

    // Stop: Space or Enter key
    if (keyName === ' ' || keyName === '\r') {
      downPressed = false;
      upPressed = false;
      onDir('stop');
    }

    // Exit the game with Ctrl+C
    if (keyName === '\u0003') {  // Ctrl+C only exits the game
      console.log("Exiting game... Returning to menu.");
      
      // Stop the key listener
      process.stdin.removeListener('data', keyListener);

      // Set isGameActive to false and return to menu
      setGameActive(false);

      mainMenu();
    }
  };

  // Start listening for keypress events
  process.stdin.on('data', keyListener);
}
