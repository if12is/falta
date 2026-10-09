import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Same Arabic 101 map as cli/falta.mjs (src/falta-core.js, layout "windows").
// Writes the flipped text with no extra newline, so a paste does not add a line.
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
await import(pathToFileURL(join(root, "src", "falta-core.js")).href);

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) {
  console.error("usage: node scripts/startup/flip.mjs input.txt output.txt");
  process.exit(2);
}

const text = readFileSync(inputPath, "utf8");
const result = globalThis.FaltaCore.convertText(text, {
  layout: "windows",
  lamAlef: "single",
  direction: "auto",
});
writeFileSync(outputPath, result.text ?? "", "utf8");
