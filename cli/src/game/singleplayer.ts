import { CLIRenderer } from "../renderer/CLIRenderer";
import { PongEngine } from "./PongEngine";

export async function startLocalGame() {
    const engine = new PongEngine(); // Local logic
    const renderer = new CLIRenderer();

    renderer.attachEngine(engine);
    renderer.run();
}
