import { WebSocketManager } from "../net/WebSocketManager";
import { fetchConfig, login } from "../net/apiClient";
import { CLIRenderer } from "../renderer/CLIRenderer";

export async function startRemoteGame() {
    const token = await login();
    const config = await fetchConfig();

    const ws = new WebSocketManager("ws://localhost:8080/ws");
    const renderer = new CLIRenderer();
    renderer.attachWebSocket(ws);

    renderer.run();
}
