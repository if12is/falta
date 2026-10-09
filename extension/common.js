(function (root) {
  var DEFAULTS = {
    layout: "windows",
    lamAlef: "single",
    floating: true,
    theme: "system",
    lang: "ar",
    shortcutCustom: false,
    shortcut: { key: "x", ctrl: true, shift: true, alt: false, meta: false },
    stats: { flips: 0, lastAt: 0 }
  };

  var STR = {
    ar: {
      title: "فلتة",
      lede: "الحروف فلتت؟",
      label: "النص",
      placeholder: "الصق اللي طلع غلط",
      flip: "اقلب النص",
      flipPage: "اقلب التحديد في الصفحة",
      copy: "انسخ",
      altSplit: "جرّب البديل: لا كمفتاحين",
      altSingle: "جرّب البديل: لا كمفتاح واحد",
      empty: "مفيش نص يتقلب.",
      flipped: "اتقلب.",
      copied: "اتنسخ.",
      copyFail: "النسخ ماتمشّ.",
      copyEmpty: "لسه مفيش نتيجة.",
      blocked: "الصفحة منعت التعديل. النص اتنسخ.",
      blockedFail: "الصفحة منعت التعديل، والنسخ كمان ماتمشّ.",
      layoutWin: "عربي ١٠١",
      layoutMac: "عربي الماك",
      options: "الإعدادات",
      stats: "قلبت {n} مرة",
      menu: "اقلب التخطيط"
    },
    en: {
      title: "Falta",
      lede: "Letters slipped?",
      label: "Text",
      placeholder: "Paste what came out wrong",
      flip: "Flip text",
      flipPage: "Flip the selection on the page",
      copy: "Copy",
      altSplit: "Try two keys for lam-alef",
      altSingle: "Try one key for lam-alef",
      empty: "Nothing to flip.",
      flipped: "Flipped.",
      copied: "Copied.",
      copyFail: "Copy failed.",
      copyEmpty: "Nothing to copy yet.",
      blocked: "The page blocked editing. The text was copied.",
      blockedFail: "The page blocked editing, and copy failed too.",
      layoutWin: "Arabic 101",
      layoutMac: "Mac Arabic",
      options: "Settings",
      stats: "Flipped {n} times",
      menu: "Flip layout"
    }
  };

  function t(lang, key) {
    var pack = STR[lang] || STR.ar;
    return pack[key] || STR.ar[key] || "";
  }

  function resolveTheme(theme) {
    if (theme === "light" || theme === "dark") return theme;
    return root.matchMedia && root.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.document.documentElement.setAttribute("data-theme", resolveTheme(theme));
  }

  function loadSettings() {
    return root.chrome.storage.local.get(DEFAULTS).then(function (stored) {
      return Object.assign({}, DEFAULTS, stored);
    });
  }

  function bumpStats() {
    return root.chrome.storage.local.get({ stats: DEFAULTS.stats }).then(function (cur) {
      var prev = cur.stats || DEFAULTS.stats;
      var stats = { flips: (prev.flips || 0) + 1, lastAt: Date.now() };
      return root.chrome.storage.local.set({ stats: stats }).then(function () { return stats; });
    });
  }

  function formatShortcut(shortcut) {
    var parts = [];
    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.alt) parts.push("Alt");
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.meta) parts.push("⌘");
    parts.push((shortcut.key || "").toUpperCase());
    return parts.join("+");
  }

  root.FaltaUI = {
    DEFAULTS: DEFAULTS,
    STR: STR,
    t: t,
    resolveTheme: resolveTheme,
    applyTheme: applyTheme,
    loadSettings: loadSettings,
    bumpStats: bumpStats,
    formatShortcut: formatShortcut
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
