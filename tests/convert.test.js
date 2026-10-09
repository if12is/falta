import test from "node:test";
import assert from "node:assert/strict";
import "../src/falta-core.js";

const { convertText } = globalThis.FaltaCore;

test("semicolon phrase flips to كيف حالك and back", () => {
  assert.equal(convertText(";dt phg;").text, "كيف حالك");
  assert.equal(convertText("كيف حالك").text, ";dt phg;");
});

test("dt phg; is missing the kaf key, so it is يف حالك", () => {
  assert.equal(convertText("dt phg;").text, "يف حالك");
});

test("capitals and alef forms", () => {
  assert.equal(convertText("H").text, "أ");
  assert.equal(convertText("Y").text, "إ");
  assert.equal(convertText("N").text, "آ");
  assert.equal(convertText("أ").text, "H");
  assert.equal(convertText("إ").text, "Y");
  assert.equal(convertText("آ").text, "N");
});

test("lam-alef single key and the two-key alternative", () => {
  const single = convertText("لا", { lamAlef: "single" });
  assert.equal(single.text, "b");
  assert.equal(single.alternatives, true);
  const split = convertText("لا", { lamAlef: "split" });
  assert.equal(split.text, "gh");
  assert.equal(split.alternatives, true);
  assert.equal(convertText("b").text, "لا");
  assert.equal(convertText("G").text, "لأ");
  assert.equal(convertText("T").text, "لإ");
  assert.equal(convertText("B").text, "لآ");
  assert.equal(convertText("لأ", { lamAlef: "split" }).text, "gH");
});

test("numbers and empty string stay put", () => {
  assert.equal(convertText("").text, "");
  assert.equal(convertText("").direction, "none");
  assert.equal(convertText("123").text, "123");
  assert.equal(convertText("a12").text, "ش12");
});

test("mac bottom row differs from windows", () => {
  assert.equal(convertText("z", { layout: "windows" }).text, "ئ");
  assert.equal(convertText("z", { layout: "mac" }).text, "ظ");
  assert.equal(convertText("b", { layout: "mac" }).text, "ز");
  assert.equal(convertText("b", { layout: "windows" }).text, "لا");
});

test("lam-alef ligature normalizes before the alternative", () => {
  const ligature = convertText("\uFEFB", { lamAlef: "single" });
  assert.equal(ligature.text, "b");
  assert.equal(ligature.alternatives, true);
});
