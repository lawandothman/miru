#!/usr/bin/env node
import { createRequire } from "node:module";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = resolve(__dirname, "..");
const monorepoRoot = resolve(mobileRoot, "..", "..");

const require = createRequire(import.meta.url);

function loadSharp() {
	const candidates = [
		"sharp",
		resolve(monorepoRoot, "node_modules/.pnpm/node_modules/sharp"),
	];
	for (const id of candidates) {
		try {
			return require(id);
		} catch {}
	}
	throw new Error(
		"Could not resolve sharp. Run: pnpm add -D -w sharp (or from apps/mobile).",
	);
}

const SVG_PATH = resolve(mobileRoot, "assets/splash-icon.svg");
const DARK_PATH = resolve(mobileRoot, "assets/splash-icon-dark.png");
const LIGHT_PATH = resolve(mobileRoot, "assets/splash-icon-light.png");

const sharp = loadSharp();
const darkSvg = await readFile(SVG_PATH, "utf-8");

const lightSvg = darkSvg
	.replace(/#000000/g, "__BG__")
	.replace(/#ffffff/g, "#0a0a0a")
	.replace(/__BG__/g, "#fafafa");

async function rasterize(svg, outPath) {
	const png = await sharp(Buffer.from(svg), { density: 512 })
		.resize(1024, 1024, { fit: "contain" })
		.png({ compressionLevel: 9 })
		.toBuffer();
	await writeFile(outPath, png);
	console.log(`wrote ${outPath} (${png.byteLength} bytes)`);
}

await rasterize(darkSvg, DARK_PATH);
await rasterize(lightSvg, LIGHT_PATH);
