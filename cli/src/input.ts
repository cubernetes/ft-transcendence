import * as readline from 'readline';

export function startKeyListener(onDir: (d: "up" | "down" | "stop") => void) {
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);

  process.stdin.on('keypress', (_, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    }
    switch (key.name) {
      case 'w':
      case 'up':
        onDir('up');
        break;
      case 's':
      case 'down':
        onDir('down');
        break;
      case 'space':
        onDir('stop');
        break;
    }
  });
}
