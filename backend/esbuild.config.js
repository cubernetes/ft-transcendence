import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");
const isProd = process.env.NODE_ENV === "production";

const context = await esbuild.context({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: ["node23"],
    outdir: "dist",
    format: "esm",
    minify: isProd, // Minify in production
    sourcemap: !isProd, // Disable sourcemaps in production
    packages: "external",
    define: {
        /** Define process.env.NODE_ENV to eliminate dead code in production */
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
});

if (watch) {
    await context.watch();
    console.log("Watching...");
} else {
    await context.rebuild();
    await context.dispose();
}
