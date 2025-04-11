#!/usr/bin/env ts-node
import audioManager from "./audio/AudioManager";
import { mainMenu } from "./menu/mainMenu";
import { cleanup } from "./utils/cleanup";
import { MENU_MUSIC } from "./utils/config";

process.on("SIGINT", () => cleanup());
process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    cleanup("Unexpected error.");
});

audioManager.startMusic(MENU_MUSIC);

mainMenu();
