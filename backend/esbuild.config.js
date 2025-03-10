import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const context = await esbuild.context({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: ["node20"],
    outdir: "dist",
    format: "esm",
    sourcemap: true,
    packages: "external",
});

if (watch) {
    await context.watch();
    console.log("Watching...");
} else {
    await context.rebuild();
    await context.dispose();
}
