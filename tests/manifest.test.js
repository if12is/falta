import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const manifest = JSON.parse(readFileSync(new URL("../extension/manifest.json", import.meta.url), "utf8"));

test("manifest is a local MV3 add-on for Chromium and Firefox", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.browser_specific_settings.gecko.id, "falta@if12is.github.io");
  assert.equal(manifest.commands.flip.suggested_key.default, "Ctrl+Shift+X");
  assert.equal(manifest.commands.flip.suggested_key.mac, "Command+Shift+X");
  assert.equal(manifest.host_permissions, undefined);
  assert.ok(!JSON.stringify(manifest.permissions).includes("http"));
});

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, files);
    else if (/\.(js|mjs|html|css)$/.test(name)) files.push(path);
  }
  return files;
}

test("the extension does not call the network", () => {
  const files = walk(fileURLToPath(new URL("../extension", import.meta.url)));
  files.forEach((file) => {
    const text = readFileSync(file, "utf8");
    assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon|new WebSocket/.test(text), false, file);
  });
});
