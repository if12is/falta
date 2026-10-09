/* Falta core — keyboard-layout flip, not translation.
   Windows pairs follow Microsoft KLID 00000401 (Arabic 101).
   macOS native overrides follow the published bottom-row moves
   (Z X C V B N M ] , . / ' `) and the top-row Shift harakat
   Q..I. Arabic-PC on a Mac is the Windows map; that is the default. */
(function (root) {
  var WINDOWS = [
    ["`", "ذ"], ["~", "\u0651"],
    ["q", "ض"], ["Q", "\u064E"],
    ["w", "ص"], ["W", "\u064B"],
    ["e", "ث"], ["E", "\u064F"],
    ["r", "ق"], ["R", "\u064C"],
    ["t", "ف"], ["T", "لإ"],
    ["y", "غ"], ["Y", "إ"],
    ["u", "ع"], ["U", "\u2018"],
    ["i", "ه"], ["I", "\u00F7"],
    ["o", "خ"], ["O", "\u00D7"],
    ["p", "ح"], ["P", "\u061B"],
    ["[", "ج"], ["{", "<"],
    ["]", "د"], ["}", ">"],
    ["\\", "\\"], ["|", "|"],
    ["a", "ش"], ["A", "\u0650"],
    ["s", "س"], ["S", "\u064D"],
    ["d", "ي"], ["D", "]"],
    ["f", "ب"], ["F", "["],
    ["g", "ل"], ["G", "لأ"],
    ["h", "ا"], ["H", "أ"],
    ["j", "ت"], ["J", "\u0640"],
    ["k", "ن"], ["K", "\u060C"],
    ["l", "م"], ["L", "/"],
    [";", "ك"], [":", ":"],
    ["'", "ط"], ['"', '"'],
    ["z", "ئ"], ["Z", "~"],
    ["x", "ء"], ["X", "\u0652"],
    ["c", "ؤ"], ["C", "}"],
    ["v", "ر"], ["V", "{"],
    ["b", "لا"], ["B", "لآ"],
    ["n", "ى"], ["N", "آ"],
    ["m", "ة"], ["M", "\u2019"],
    [",", "و"], ["<", ","],
    [".", "ز"], [">", "."],
    ["/", "ظ"], ["?", "\u061F"]
  ];

  var MAC_OVERRIDES = [
    ["z", "ظ"],
    ["x", "ط"],
    ["c", "ذ"],
    ["v", "د"],
    ["b", "ز"],
    ["n", "ر"],
    ["m", "و"],
    ["]", "ة"],
    [",", "\u060C"],
    ["'", "\u061B"],
    ["`", "\u0640"],
    ["E", "\u0650"],
    ["R", "\u064D"],
    ["T", "\u064F"],
    ["Y", "\u064C"],
    ["U", "\u0652"],
    ["I", "\u0651"]
  ];

  var MAC_DROP = ["B", "G", ".", "/"];

  var LIGATURES = {
    "\uFEFB": "لا",
    "\uFEFC": "لا",
    "\uFEF5": "لآ",
    "\uFEF6": "لآ",
    "\uFEF7": "لأ",
    "\uFEF8": "لأ",
    "\uFEF9": "لإ",
    "\uFEFA": "لإ"
  };

  function withOverrides(base, overrides, drop) {
    var map = new Map(base);
    (drop || []).forEach(function (key) { map.delete(key); });
    overrides.forEach(function (pair) { map.set(pair[0], pair[1]); });
    return Array.from(map.entries());
  }

  function compile(pairs) {
    var enToAr = new Map();
    var arToEn = new Map();
    var multi = new Map();
    pairs.forEach(function (pair) {
      var en = pair[0];
      var ar = pair[1];
      if (en === ar) return;
      enToAr.set(en, ar);
      if (Array.from(ar).length > 1) {
        if (!multi.has(ar)) multi.set(ar, en);
        return;
      }
      if (!arToEn.has(ar)) arToEn.set(ar, en);
    });
    return { enToAr: enToAr, arToEn: arToEn, multi: multi };
  }

  var LAYOUTS = {
    windows: compile(WINDOWS),
    mac: compile(withOverrides(WINDOWS, MAC_OVERRIDES, MAC_DROP))
  };

  function isArabic(ch) {
    var c = ch.codePointAt(0);
    return (c >= 0x0600 && c <= 0x06FF) ||
      (c >= 0x0750 && c <= 0x077F) ||
      (c >= 0x08A0 && c <= 0x08FF) ||
      (c >= 0xFB50 && c <= 0xFDFF) ||
      (c >= 0xFE70 && c <= 0xFEFF);
  }

  function normalize(text) {
    var out = "";
    Array.from(text).forEach(function (ch) {
      out += LIGATURES[ch] || ch;
    });
    return out;
  }

  function detectDirection(text) {
    var ar = 0;
    var en = 0;
    var first = null;
    Array.from(normalize(text)).forEach(function (ch) {
      if (isArabic(ch)) {
        ar += 1;
        if (!first) first = "to-english";
      } else if (/[A-Za-z]/.test(ch)) {
        en += 1;
        if (!first) first = "to-arabic";
      }
    });
    if (ar === 0 && en === 0) return "none";
    if (ar === en) return first;
    return ar > en ? "to-english" : "to-arabic";
  }

  function detectPlatform() {
    var nav = root.navigator;
    var proc = root.process;
    var platform = (nav && nav.platform) || (proc && proc.platform) || "";
    var p = String(platform).toLowerCase();
    if (p.indexOf("mac") !== -1 || p === "darwin") return "mac";
    if (p.indexOf("win") !== -1) return "win";
    if (p.indexOf("linux") !== -1) return "linux";
    return "other";
  }

  function convertText(text, options) {
    var opts = options || {};
    var layoutName = opts.layout === "mac" ? "mac" : "windows";
    var layout = LAYOUTS[layoutName];
    var lamAlef = opts.lamAlef === "split" ? "split" : "single";
    var source = normalize(text || "");
    var direction = opts.direction && opts.direction !== "auto"
      ? opts.direction
      : detectDirection(source);

    if (!source || direction === "none" || (direction !== "to-english" && direction !== "to-arabic")) {
      return {
        text: text || "",
        direction: "none",
        alternatives: false,
        layout: layoutName
      };
    }

    var chars = Array.from(source);
    var out = "";
    var alternatives = false;

    for (var i = 0; i < chars.length; i += 1) {
      if (direction === "to-english") {
        var pair = chars[i] + (chars[i + 1] || "");
        if (layout.multi.has(pair)) {
          alternatives = true;
          if (lamAlef === "single") {
            out += layout.multi.get(pair);
            i += 1;
            continue;
          }
        }
        out += layout.arToEn.has(chars[i]) ? layout.arToEn.get(chars[i]) : chars[i];
        continue;
      }
      if (layout.enToAr.has(chars[i])) out += layout.enToAr.get(chars[i]);
      else out += chars[i];
    }

    return {
      text: out,
      direction: direction,
      alternatives: alternatives,
      layout: layoutName
    };
  }

  root.FaltaCore = {
    convertText: convertText,
    detectDirection: detectDirection,
    detectPlatform: detectPlatform,
    layouts: ["windows", "mac"],
    version: "1.0.0"
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
