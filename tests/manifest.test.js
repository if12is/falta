import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";
import { buildPackages, firefoxManifest } from "../scripts/pack.mjs";

const manifest = JSON.parse(readFileSync(new URL("../extension/manifest.json", import.meta.url), "utf8"));

function readZipEntry(zip, wanted) {
  let offset = 0;
  while (offset + 30 <= zip.length) {
    if (zip.readUInt32LE(offset) !== 0x04034b50) break;
    const method = zip.readUInt16LE(offset + 8);
    const compSize = zip.readUInt32LE(offset + 18);
    const nameLen = zip.readUInt16LE(offset + 26);
    const extraLen = zip.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const name = zip.subarray(nameStart, nameStart + nameLen).toString("utf8");
    const dataStart = nameStart + nameLen + extraLen;
    const payload = zip.subarray(dataStart, dataStart + compSize);
    if (name === wanted) {
      const raw = method === 0 ? payload : inflateRawSync(payload);
      return raw.toString("utf8");
    }
    offset = dataStart + compSize;
  }
  throw new Error(`missing ${wanted}`);
}

test("manifest is a local MV3 add-on for Chromium and Firefox", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.browser_specific_settings.gecko.id, "falta@if12is.github.io");
  assert.equal(manifest.browser_specific_settings.gecko.strict_min_version, "115.0");
  assert.deepEqual(manifest.browser_specific_settings.gecko.data_collection_permissions, {
    required: ["none"],
  });
  assert.equal(manifest.commands.flip.suggested_key.default, "Ctrl+Shift+X");
  assert.equal(manifest.commands.flip.suggested_key.mac, "Command+Shift+X");
  assert.equal(manifest.host_permissions, undefined);
  assert.ok(!JSON.stringify(manifest.permissions).includes("http"));
});

test("firefox package uses background.scripts and chromium keeps service_worker only", () => {
  assert.deepEqual(manifest.background, { service_worker: "background.js" });

  const firefox = firefoxManifest(manifest);
  assert.deepEqual(firefox.background, { scripts: ["background.js"] });
  assert.equal(firefox.background.service_worker, undefined);
  assert.equal(firefox.manifest_version, manifest.manifest_version);
  assert.equal(firefox.browser_specific_settings.gecko.id, manifest.browser_specific_settings.gecko.id);
  assert.equal(firefox.browser_specific_settings.gecko.strict_min_version, "115.0");
  assert.deepEqual(firefox.browser_specific_settings.gecko.data_collection_permissions, {
    required: ["none"],
  });
  assert.deepEqual(firefox.permissions, manifest.permissions);

  const packed = buildPackages();
  const chromiumManifest = JSON.parse(readZipEntry(packed.chromium.body, "manifest.json"));
  const firefoxManifestJson = JSON.parse(readZipEntry(packed.firefox.body, "manifest.json"));
  assert.deepEqual(chromiumManifest.background, { service_worker: "background.js" });
  assert.equal(chromiumManifest.background.scripts, undefined);
  assert.deepEqual(firefoxManifestJson.background, { scripts: ["background.js"] });
  assert.equal(firefoxManifestJson.background.service_worker, undefined);
  assert.deepEqual(firefoxManifestJson.browser_specific_settings.gecko.data_collection_permissions, {
    required: ["none"],
  });
  const { background: chromiumBackground, ...chromiumRest } = chromiumManifest;
  const { background: firefoxBackground, ...firefoxRest } = firefoxManifestJson;
  assert.deepEqual(firefoxRest, chromiumRest);
  assert.deepEqual(chromiumBackground, { service_worker: "background.js" });
  assert.deepEqual(firefoxBackground, { scripts: ["background.js"] });
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
