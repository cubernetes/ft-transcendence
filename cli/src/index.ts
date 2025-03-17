import { CLIControl } from './CLIControl';

const serverUrl = 'ws://localhost:8080/ws';
const cliControl = new CLIControl(serverUrl);

console.log("Pong CLI Game Started!");
console.log("Use 'w' and 's' to move the paddle up and down. Arrow keys work too.");
