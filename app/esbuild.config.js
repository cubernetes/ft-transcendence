import * as esbuild from "esbuild";

const isProd = process.env.NODE_ENV === "production";
const watch = process.argv.includes("--watch");

const context = await esbuild.context({
    entryPoints: ["src/scripts/index.ts"],
    bundle: true,
    outfile: "dist/bundle.js",
    minify: isProd, // Minify in production
    sourcemap: !isProd, // Disable sourcemaps in production
});

if (watch) {
    await context.watch();
    console.log("Watching...");
} else {
    await context.rebuild();
    await context.dispose();
}
