import * as esbuild from "esbuild";
import { promises as fs } from "fs";
import * as path from "path";

const isProd = process.env.NODE_ENV === "production";
const watch = process.argv.includes("--watch");

const context = await esbuild.context({
    entryPoints: ["src/scripts/index.ts"],
    bundle: true,
    outfile: "dist/bundle.js",
    minify: isProd, // Minify in production
    sourcemap: !isProd, // Disable sourcemaps in production
});

// Copies a file or a directory (recursively) to another location (file or directory)
// Copies a file or a directory (recursively) to another location (file or directory)
const copyFiles = async (src, dest) => {
    const stats = await fs.stat(src);
    if (stats.isDirectory()) {
        await fs.mkdir(dest, { recursive: true });
        const entries = await fs.readdir(src);
        for (const entry of entries) {
            const srcPath = path.join(src, entry);
            const destPath = path.join(dest, entry);
            await copyFiles(srcPath, destPath);
        }
    } else {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(src, dest);
    }
};

if (watch) {
    await context.watch();
    console.log("Watching...");
    await copyFiles("./src/public/index.html", "./dist/index.html");
    await copyFiles("./src/public/assets", "./dist/assets");
} else {
    await context.rebuild();
    await copyFiles("./src/public/index.html", "./dist/index.html");
    await copyFiles("./src/public/assets", "./dist/assets");
    await context.dispose();
}
