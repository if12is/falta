import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir, platform } from "node:os";
import path from "node:path";
import {
  chooseLayout,
  configDir,
  fixedShortcut,
  flipOptions,
  parseSettings,
  readLayout,
  settingsPath,
} from "../scripts/startup/settings.mjs";
import "../src/falta-core.js";

const { convertText } = globalThis.FaltaCore;

test("broken settings stay on Arabic 101 and keep no shortcut", () => {
  assert.equal(chooseLayout(undefined), "windows");
  assert.equal(chooseLayout("mac"), "mac");
  assert.equal(chooseLayout(" mac "), "mac");
  assert.equal(chooseLayout("MAC"), "windows");
  assert.equal(chooseLayout("linux"), "windows");
  assert.deepEqual(parseSettings(""), { layout: "windows" });
  assert.deepEqual(parseSettings("{"), { layout: "windows" });
  assert.deepEqual(parseSettings("[]"), { layout: "windows" });
  assert.deepEqual(parseSettings("null"), { layout: "windows" });
  assert.deepEqual(parseSettings('\uFEFF{"layout":"windows"}'), { layout: "windows" });
  assert.deepEqual(parseSettings('{"layout":"mac"}\n'), { layout: "mac" });
  const parsed = parseSettings('{"layout":"mac","shortcut":{"key":"k","ctrl":true,"alt":true}}');
  assert.deepEqual(parsed, { layout: "mac" });
  assert.deepEqual(Object.keys(parsed), ["layout"]);
});

test("the hotkey shortcut is fixed text for each system", () => {
  assert.equal(fixedShortcut("win32"), "Ctrl+Shift+Y");
  assert.equal(fixedShortcut("linux"), "Ctrl+Shift+Y");
  assert.equal(fixedShortcut("darwin"), "Command+Shift+Y");
  assert.equal(fixedShortcut("freebsd"), "Ctrl+Shift+Y");
});

test("layout choice is what the hotkey converter applies", () => {
  assert.deepEqual(flipOptions("mac"), {
    layout: "mac",
    lamAlef: "single",
    direction: "auto",
  });
  assert.equal(flipOptions("nope").layout, "windows");
  assert.equal(convertText("z", flipOptions("windows")).text, "ئ");
  assert.equal(convertText("z", flipOptions(undefined)).text, "ئ");
  assert.equal(convertText("z", flipOptions("mac")).text, "ظ");
  assert.equal(convertText("b", flipOptions("windows")).text, "لا");
  assert.equal(convertText("b", flipOptions("mac")).text, "ز");
});

test("settings file paths follow Windows, Linux, and Mac", () => {
  assert.equal(
    settingsPath({ LOCALAPPDATA: "C:\\Users\\A\\AppData\\Local" }, "win32", "C:\\Users\\A"),
    path.win32.join("C:\\Users\\A\\AppData\\Local", "Falta", "settings.json"),
  );
  assert.equal(
    configDir({}, "win32", "C:\\Users\\A"),
    path.win32.join("C:\\Users\\A", "AppData", "Local", "Falta"),
  );
  assert.equal(
    settingsPath({ XDG_CONFIG_HOME: "/home/a/.config" }, "linux", "/home/a"),
    "/home/a/.config/falta/settings.json",
  );
  assert.equal(
    settingsPath({ XDG_CONFIG_HOME: "" }, "linux", "/home/a"),
    "/home/a/.config/falta/settings.json",
  );
  assert.equal(
    settingsPath({}, "darwin", "/Users/a"),
    "/Users/a/Library/Application Support/Falta/settings.json",
  );
});

test("readLayout uses the file for this system and falls back when it is missing", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "falta-settings-"));
  const plat = platform();
  const env = plat === "win32" ? { LOCALAPPDATA: dir } : { XDG_CONFIG_HOME: dir };
  const home = plat === "darwin" ? dir : path.join(dir, "unused-home");
  try {
    assert.equal(readLayout(env, plat, home), "windows");
    const file = settingsPath(env, plat, home);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, '{"layout":"mac"}\n', "utf8");
    assert.equal(readLayout(env, plat, home), "mac");
    writeFileSync(file, "{", "utf8");
    assert.equal(readLayout(env, plat, home), "windows");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
