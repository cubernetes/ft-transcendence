import chokidar from "chokidar";
import * as esbuild from "esbuild";
import fse from "fs-extra";
import * as path from "path";

const isProd = process.env.NODE_ENV === "production";
const watch = process.argv.includes("--watch");

const context = await esbuild.context({
    entryPoints: ["src/scripts/index.ts"],
    format: "esm",
    bundle: true,
    outfile: "dist/bundle.js",
    minify: isProd, // Minify in production
    sourcemap: !isProd, // Disable sourcemaps in production
    define: {
        "process.env.WATCH": JSON.stringify(watch ? "1" : "0"),
        "process.env.NODE_ENV": JSON.stringify(isProd ? "production" : "development"),
        "process.env.LIVE_RELOAD_PORT": JSON.stringify(process.env.LIVE_RELOAD_PORT ?? 35729),
    },
});

const handleAssetUpdate = (filePath) => {
    const resolvedPath = path.resolve(filePath); // Normalize path for all OS
    const assetsRoot = path.resolve("src/public/assets");

    if (resolvedPath === path.resolve("src/public/index.html")) {
        console.log("index.html copied to dist/");
        fse.copySync("./src/public/index.html", "./dist/index.html");
        return;
    }

    if (resolvedPath.startsWith(assetsRoot)) {
        const relativeAssetPath = path.relative("src/public", filePath);
        const destPath = path.join("dist", relativeAssetPath);

        fse.copySync(filePath, destPath);
        console.log(`Asset copied: ${relativeAssetPath}`);
    }
};

const handleAssetRemove = (filePath) => {
    const relativeAssetPath = path.relative("src/public", filePath);
    const destPath = path.join("dist", relativeAssetPath);

    fse.removeSync(destPath);
    console.log(`Asset removed: ${relativeAssetPath}`);
};

if (watch) {
    fse.copyFileSync("./src/public/index.html", "./dist/index.html");
    fse.copySync("./src/public/assets", "./dist/assets", {
        overwrite: true,
        recursive: true,
    });
    await context.watch();

    // Watch extra files that aren't in the dependency graph
    const watcher = chokidar.watch(["./src/public/index.html", "./src/public/assets"], {
        persistent: true,
        ignoreInitial: true,
        usePolling: true, // Useful for Docker volume mounts
        interval: 300, // Check every 300ms
        awaitWriteFinish: {
            stabilityThreshold: 200, // Wait for 200ms before considering a file stable
            pollInterval: 100, // Check every 100ms
        },
    });

    watcher
        .on("change", handleAssetUpdate) // Handle file changes
        .on("add", handleAssetUpdate) // Handle file additions
        .on("unlink", handleAssetRemove); // Handle file removals

    console.log("Watching...");
} else {
    fse.copyFileSync("./src/public/index.html", "./dist/index.html");
    fse.copySync("./src/public/assets", "./dist/assets", {
        overwrite: true,
        recursive: true,
    });
    await context.rebuild();
    await context.dispose();
}
