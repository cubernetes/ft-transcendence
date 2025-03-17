import { connectWS, sendInput } from './ws.ts';
import { startKeyListener } from './input.ts';
import { startRenderLoop } from './render.ts';

async function main() {
  console.clear();
  console.log("Starting Pong CLI...");

  const ws = await connectWS();

  startKeyListener((direction) => {
    sendInput(ws, direction);
  });

  startRenderLoop(ws);
}

main().catch(err => {
  console.error("Fatal:", err);
});
