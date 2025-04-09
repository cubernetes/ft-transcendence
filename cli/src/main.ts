#!/usr/bin/env ts-node
import audioManager from "./audio/audioManager";
import { mainMenu } from "./menu/index";
import { cleanup } from "./utils/cleanup";

// Optional global event hooks
process.on("SIGINT", () => cleanup());
process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    cleanup("Unexpected error.");
});

// Start background music (optional)
audioManager.startMusic("menu");

// Start main CLI loop
mainMenu();
