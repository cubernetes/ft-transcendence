#!/usr/bin/env ts-node
import chalk from "chalk";
import { mainMenu } from "./menu/mainMenu";
import { cleanup } from "./utils/cleanup";

process.on("SIGINT", () => cleanup());

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error(chalk.red("❌ An unexpected error occurred (uncaught exception):"), err);
    cleanup(); // Perform cleanup before exiting
    process.exit(1); // Exit the process with an error code
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error(chalk.red("❌ An unhandled promise rejection occurred:"), reason);
    cleanup(); // Perform cleanup before exiting
    process.exit(1); // Exit the process with an error code
});

mainMenu();
