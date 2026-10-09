import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

mkdirSync("extension", { recursive: true });
mkdirSync("web", { recursive: true });
mkdirSync("bookmarklet", { recursive: true });

copyFileSync("src/falta-core.js", "extension/falta-core.js");
copyFileSync("src/falta-core.js", "web/falta-core.js");
copyFileSync("src/tokens.css", "extension/tokens.css");

const core = readFileSync("src/falta-core.js", "utf8");
const ui = readFileSync("src/bookmarklet-ui.js", "utf8");
const href = "javascript:" + encodeURIComponent(core + "\n" + ui);
writeFileSync("bookmarklet/falta.js", href + "\n");
writeFileSync("web/bookmarklet-data.js", "globalThis.FALTA_BOOKMARKLET = " + JSON.stringify(href) + ";\n");

console.log("built falta core, tokens, and bookmarklet");
