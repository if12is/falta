import "../src/falta-core.js";

const { convertText } = globalThis.FaltaCore;

function help() {
  console.log(`فلتة — اقلب تخطيط الكيبورد

  node cli/falta.mjs ";dt phg;"
  node cli/falta.mjs --layout mac z
  node cli/falta.mjs --split "لا"
  echo text | node cli/falta.mjs

  --layout windows|mac     عربي ١٠١ أو عربي الماك
  --split                  لا كمفتاحين
  --to ar|en               اتجاه ثابت
`);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  help();
  process.exit(0);
}

const options = { layout: "windows", lamAlef: "single", direction: "auto" };
const words = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--layout") options.layout = args[++i] === "mac" ? "mac" : "windows";
  else if (args[i] === "--split") options.lamAlef = "split";
  else if (args[i] === "--to") options.direction = args[++i] === "en" ? "to-english" : "to-arabic";
  else words.push(args[i]);
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const fromArgs = words.join(" ");
const text = fromArgs || await readStdin();
if (!text) {
  help();
  process.exit(1);
}
const result = convertText(text.replace(/\r?\n$/, ""), options);
process.stdout.write(result.text + (result.text.endsWith("\n") ? "" : "\n"));
