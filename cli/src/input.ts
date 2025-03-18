// @ts-ignore
import keypress from 'keypress';

// Function to start listening for key presses
export function startKeyListener(onDir: (d: "up" | "down" | "stop") => void) {
  let upPressed = false;
  let downPressed = false;

  // Attach keypress handler to stdin
  keypress(process.stdin);

  // Enable raw mode to capture keypresses directly
  process.stdin.setRawMode(true);
  process.stdin.resume();

  // Listen for keypress events
  process.stdin.on('keypress', (ch: string, key: any) => {
    if (key) {
      if (key.name === 'up' && !upPressed) {
        upPressed = true;
        downPressed = false;
        onDir('up');
      } 

      else if (key.name === 'down' && !downPressed) {
        downPressed = true;
        upPressed = false;
        onDir('down');
      }

      if (key.name === 'space') {
        downPressed = false;
        upPressed = false;
        onDir('stop');  // Trigger stop when Space is pressed
      }

      if (key.ctrl && key.name === 'c') {
        console.log("Exiting...");
        process.exit(0);
      }
    }
  });
}

// Example usage
startKeyListener((d) => {
  console.log(`Direction: ${d}`);
});
