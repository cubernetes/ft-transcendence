#!/usr/bin/env ts-node
import { mainMenu } from "./menu/mainMenu";
import { cleanup } from "./utils/cleanup";

process.on("SIGINT", () => cleanup());
process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    cleanup("Unexpected error.");
});

mainMenu();
