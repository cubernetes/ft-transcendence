import { WebSocketServer } from "ws";
import chokidar from "chokidar";

const wss = new WebSocketServer({ port: 35729, host: "0.0.0.0" }); // Classic livereload port

wss.on("connection", (ws) => {
    console.log("Browser connected for live reload");
});

chokidar.watch("dist").on("change", (filePath) => {
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send("reload");
        }
    });
});
