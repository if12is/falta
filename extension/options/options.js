var ui = globalThis.FaltaUI;
var settings = Object.assign({}, ui.DEFAULTS);
var capturing = false;

var COPY = {
  ar: {
    kicker: "فلتة",
    heading: "الإعدادات",
    layout: "لوحة المفاتيح",
    win: "عربي ١٠١ — ويندوز، لينكس، و Arabic-PC",
    mac: "عربي الماك الأصلي",
    layoutHint: "الافتراضي عربي ١٠١ حتى على الماك، لأن ناس كتير بتستخدم Arabic-PC.",
    lam: "حرف لا",
    single: "مفتاح واحد (b) وبعدين زر البديل",
    split: "مفتاحين (gh) من الأول",
    floating: "الزر العائم جنب التحديد",
    theme: "السمة",
    system: "زي الجهاز",
    light: "فاتح",
    dark: "غامق",
    language: "اللغة",
    shortcut: "الاختصار جوا الصفحات",
    capture: "اضغط الاختصار الجديد",
    shortHint: "لازم فيه Ctrl أو Alt أو ⌘. اختصار المتصفح نفسه يتظبط من صفحة اختصارات الإضافات.",
    sample: "تجربة",
    stats: "قلبت {n} مرة على الجهاز ده.",
    needMod: "حط معاها Ctrl أو Alt أو ⌘."
  },
  en: {
    kicker: "Falta",
    heading: "Settings",
    layout: "Keyboard",
    win: "Arabic 101 — Windows, Linux, and Arabic-PC",
    mac: "Native Mac Arabic",
    layoutHint: "Arabic 101 stays the default even on a Mac, because many people use Arabic-PC.",
    lam: "The lam-alef letter",
    single: "One key (b), then the alternative button",
    split: "Two keys (gh) from the start",
    floating: "Floating button beside the selection",
    theme: "Theme",
    system: "Match the device",
    light: "Light",
    dark: "Dark",
    language: "Language",
    shortcut: "Shortcut inside pages",
    capture: "Press the new shortcut",
    shortHint: "It needs Ctrl, Alt, or ⌘. The browser command itself is changed on the extensions shortcuts page.",
    sample: "Try it",
    stats: "Flipped {n} times on this device.",
    needMod: "Add Ctrl, Alt, or ⌘."
  }
};

function say(key) { return COPY[settings.lang === "en" ? "en" : "ar"][key]; }

function paint() {
  document.documentElement.lang = settings.lang === "en" ? "en" : "ar";
  document.documentElement.dir = settings.lang === "en" ? "ltr" : "rtl";
  ui.applyTheme(settings.theme);
  document.getElementById("kicker").textContent = say("kicker");
  document.getElementById("heading").textContent = say("heading");
  document.getElementById("layout-label").textContent = say("layout");
  document.getElementById("win").textContent = say("win");
  document.getElementById("mac").textContent = say("mac");
  document.getElementById("layout-hint").textContent = say("layoutHint");
  document.getElementById("lam-label").textContent = say("lam");
  document.getElementById("lam-single").textContent = say("single");
  document.getElementById("lam-split").textContent = say("split");
  document.getElementById("float-label").textContent = say("floating");
  document.getElementById("theme-label").textContent = say("theme");
  document.getElementById("theme-system").textContent = say("system");
  document.getElementById("theme-light").textContent = say("light");
  document.getElementById("theme-dark").textContent = say("dark");
  document.getElementById("lang-label").textContent = say("language");
  document.getElementById("short-label").textContent = say("shortcut");
  document.getElementById("short-hint").textContent = say("shortHint");
  document.getElementById("sample-label").textContent = say("sample");
  document.getElementById("capture").textContent = capturing ? say("capture") : ui.formatShortcut(settings.shortcut);
  document.title = say("heading");
  document.querySelector("input[name=layout][value='" + (settings.layout === "mac" ? "mac" : "windows") + "']").checked = true;
  document.querySelector("input[name=lam][value='" + (settings.lamAlef === "split" ? "split" : "single") + "']").checked = true;
  document.querySelector("input[name=theme][value='" + (settings.theme || "system") + "']").checked = true;
  document.querySelector("input[name=lang][value='" + (settings.lang === "en" ? "en" : "ar") + "']").checked = true;
  document.getElementById("floating").checked = settings.floating !== false;
  var n = (settings.stats && settings.stats.flips) || 0;
  document.getElementById("stats").textContent = say("stats").replace("{n}", String(n));
  preview();
}

function preview() {
  var result = globalThis.FaltaCore.convertText(document.getElementById("sample").value, {
    layout: settings.layout,
    lamAlef: settings.lamAlef
  });
  document.getElementById("sample-out").textContent = result.text;
}

function save(partial) {
  Object.assign(settings, partial);
  chrome.storage.local.set(partial);
  paint();
}

document.querySelectorAll("input[name=layout]").forEach(function (input) {
  input.addEventListener("change", function () { if (input.checked) save({ layout: input.value }); });
});
document.querySelectorAll("input[name=lam]").forEach(function (input) {
  input.addEventListener("change", function () { if (input.checked) save({ lamAlef: input.value }); });
});
document.querySelectorAll("input[name=theme]").forEach(function (input) {
  input.addEventListener("change", function () { if (input.checked) save({ theme: input.value }); });
});
document.querySelectorAll("input[name=lang]").forEach(function (input) {
  input.addEventListener("change", function () { if (input.checked) save({ lang: input.value }); });
});
document.getElementById("floating").addEventListener("change", function (event) {
  save({ floating: event.target.checked });
});
document.getElementById("sample").addEventListener("input", preview);

var capture = document.getElementById("capture");
capture.addEventListener("click", function () {
  capturing = true;
  paint();
  capture.focus();
});
capture.addEventListener("keydown", function (event) {
  if (!capturing) return;
  event.preventDefault();
  if (["Control", "Shift", "Alt", "Meta"].indexOf(event.key) !== -1) return;
  if (!event.ctrlKey && !event.altKey && !event.metaKey) {
    document.getElementById("short-hint").textContent = say("needMod");
    return;
  }
  capturing = false;
  save({
    shortcutCustom: true,
    shortcut: {
      key: event.key.toLowerCase(),
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey
    }
  });
});

ui.loadSettings().then(function (stored) {
  settings = stored;
  paint();
});
