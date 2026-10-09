import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/tokens.css", import.meta.url), "utf8");

function token(name) {
  const match = css.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(match, `missing ${name}`);
  return match[1].toLowerCase();
}

function lum(hex) {
  const parts = hex.slice(1).match(/../g).map((byte) => {
    const s = parseInt(byte, 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2];
}

function contrast(a, b) {
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}

const pairs = [
  ["ink on paper", "--color-neutral-900", "--color-neutral-50", 4.5],
  ["muted on paper", "--color-neutral-700", "--color-neutral-50", 4.5],
  ["primary-800 on paper", "--color-primary-800", "--color-neutral-50", 4.5],
  ["cream on primary-800", "--color-primary-50", "--color-primary-800", 4.5],
  ["secondary-800 on paper", "--color-secondary-800", "--color-neutral-50", 4.5],
  ["success on paper", "--color-success", "--color-neutral-50", 4.5],
  ["error on paper", "--color-error", "--color-neutral-50", 4.5],
  ["warning on paper", "--color-warning", "--color-neutral-50", 4.5],
  ["info on paper", "--color-info", "--color-neutral-50", 4.5],
  ["dark ink on clay button", "--color-neutral-900", "--color-primary-200", 4.5]
];

test("light text pairs pass WCAG AA", () => {
  pairs.forEach(([name, fg, bg, min]) => {
    const ratio = contrast(token(fg), token(bg));
    assert.ok(ratio >= min, `${name} ${ratio.toFixed(2)} < ${min}`);
  });
});

test("dark text pairs pass WCAG AA", () => {
  const dark = [
    ["#f7f3ec", "#14110f", "cream on night"],
    ["#d5c6b4", "#14110f", "muted on night"],
    ["#e7c3a4", "#14110f", "clay on night"],
    ["#2a1c14", "#e7c3a4", "ink on dark-mode button"],
    ["#b7d7a8", "#14110f", "success on night"],
    ["#f0b2aa", "#14110f", "error on night"]
  ];
  dark.forEach(([fg, bg, name]) => {
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= 4.5, `${name} ${ratio.toFixed(2)}`);
  });
});
