// Local desktop settings for the system-wide hotkey.
// The file stores the keyboard layout only. The shortcut is fixed per
// system and is not written here, so it cannot drift from the listener
// or from the browser extension's own shortcut object.
import { readFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import path from "node:path";

export const FIXED_SHORTCUT = {
  win32: "Ctrl+Shift+Y",
  linux: "Ctrl+Shift+Y",
  darwin: "Command+Shift+Y",
};

export function fixedShortcut(plat = platform()) {
  if (plat === "darwin") return FIXED_SHORTCUT.darwin;
  if (plat === "win32") return FIXED_SHORTCUT.win32;
  return FIXED_SHORTCUT.linux;
}

export function chooseLayout(value) {
  if (typeof value !== "string") return "windows";
  return value.trim() === "mac" ? "mac" : "windows";
}

export function parseSettings(text) {
  const fallback = { layout: "windows" };
  if (typeof text !== "string") return fallback;
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return fallback;
  try {
    const data = JSON.parse(cleaned);
    if (!data || typeof data !== "object" || Array.isArray(data)) return fallback;
    return { layout: chooseLayout(data.layout) };
  } catch {
    return fallback;
  }
}

export function flipOptions(layout) {
  return {
    layout: chooseLayout(layout),
    lamAlef: "single",
    direction: "auto",
  };
}

export function configDir(env = process.env, plat = platform(), home = homedir()) {
  if (plat === "win32") {
    const base = env.LOCALAPPDATA || path.win32.join(home, "AppData", "Local");
    return path.win32.join(base, "Falta");
  }
  if (plat === "darwin") {
    return path.posix.join(home, "Library", "Application Support", "Falta");
  }
  const base = env.XDG_CONFIG_HOME || path.posix.join(home, ".config");
  return path.posix.join(base, "falta");
}

export function settingsPath(env = process.env, plat = platform(), home = homedir()) {
  const dir = configDir(env, plat, home);
  if (plat === "win32") return path.win32.join(dir, "settings.json");
  return path.posix.join(dir, "settings.json");
}

export function readLayout(env = process.env, plat = platform(), home = homedir()) {
  try {
    return parseSettings(readFileSync(settingsPath(env, plat, home), "utf8")).layout;
  } catch {
    return "windows";
  }
}
