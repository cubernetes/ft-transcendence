import chokidar from "chokidar";
import { WebSocketServer } from "ws";

const port = process.env.LIVE_RELOAD_PORT ?? 35729; // Classic livereload port as default
const wss = new WebSocketServer({ port, host: "0.0.0.0" });

wss.on("connection", (_) => {
    console.log(`Browser connected for live reload at port ${port}`);
});

chokidar.watch("dist").on("change", (path) => {
    if (path.includes("uploads")) return; // Ignore upload folder

    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send("reload");
        }
    });
});
