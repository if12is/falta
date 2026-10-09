(function () {
  var STR = {
    ar: {
      skip: "للتنزيل",
      "nav.label": "الأقسام",
      "nav.tool": "الأداة",
      "nav.home": "الهوية",
      theme: "السمة",
      title: "نزّل فلتة",
      lead: "اختار المتصفح أو النظام. الرابط دايمًا آخر نسخة، وكل رفع جديد على جيت هب يحدّث الملف نفسه.",
      browsers: "المتصفحات",
      systems: "الجهاز",
      dl: "نزّل",
      open: "افتح الأداة",
      "file.chromium": "الملف: falta-chromium.zip",
      "file.firefox": "الملف: falta-firefox.zip",
      "file.win": "الملف: falta-windows.zip",
      "file.ubuntu": "الملف: falta-ubuntu.zip",
      "file.mac": "الملف: falta-macos.zip",
      "file.safari": "مفيش ملف إضافة لسفاري",
      "chrome.1": "نزّل الملف وفك الضغط.",
      "chrome.2": "افتح chrome://extensions",
      "chrome.3": "فعّل وضع المطوّر.",
      "chrome.4": "Load unpacked، واختار المجلد اللي فيه manifest.json.",
      "edge.1": "نزّل نفس الملف وفك الضغط.",
      "edge.2": "افتح edge://extensions",
      "edge.3": "فعّل وضع المطوّر.",
      "edge.4": "Load unpacked، واختار المجلد اللي فيه manifest.json.",
      "brave.1": "نزّل نفس الملف وفك الضغط.",
      "brave.2": "افتح brave://extensions",
      "brave.3": "فعّل وضع المطوّر.",
      "brave.4": "Load unpacked، واختار المجلد اللي فيه manifest.json.",
      "opera.1": "نزّل نفس الملف وفك الضغط.",
      "opera.2": "افتح opera://extensions",
      "opera.3": "فعّل وضع المطوّر.",
      "opera.4": "Load unpacked، واختار المجلد اللي فيه manifest.json.",
      "vivaldi.1": "نزّل نفس الملف وفك الضغط.",
      "vivaldi.2": "افتح vivaldi://extensions",
      "vivaldi.3": "فعّل وضع المطوّر.",
      "vivaldi.4": "Load unpacked، واختار المجلد اللي فيه manifest.json.",
      "firefox.1": "نزّل الملف وفك الضغط.",
      "firefox.2": "افتح about:debugging",
      "firefox.3": "This Firefox، ثم Load Temporary Add-on.",
      "firefox.4": "اختار manifest.json. الإضافة بتتشال لما فايرفوكس يقفل.",
      "safari.1": "سفاري مش بيحمّل مجلد الإضافة.",
      "safari.2": "افتح صفحة الأداة في سفاري.",
      "safari.3": "الصق النص واضغط اقلب. التحويل بيحصل في الصفحة.",
      "win.1": "نزّل الملف وفك الضغط في مجلد ما تحذفوش.",
      "win.2": "للإضافة: من كروم أو إيدج حمّل مجلد extension اللي جوه.",
      "win.3": "عشان تفتح مع تشغيل الجهاز، من جذر المجلد:",
      "win.4": "powershell -ExecutionPolicy Bypass -File scripts\\startup\\install-windows.ps1",
      "ubuntu.1": "نزّل الملف وفك الضغط في مجلد ما تحذفوش.",
      "ubuntu.2": "للإضافة: حمّل مجلد extension من المتصفح.",
      "ubuntu.3": "عشان تفتح مع تسجيل الدخول:",
      "ubuntu.4": "sh scripts/startup/install-linux.sh",
      "mac.1": "نزّل الملف وفك الضغط في مجلد ما تحذفوش.",
      "mac.2": "للإضافة: حمّل مجلد extension من المتصفح.",
      "mac.3": "الاختصار Command+Shift+Y. عشان تفتح مع تسجيل الدخول:",
      "mac.4": "sh scripts/startup/install-macos.sh"
    },
    en: {
      skip: "Skip to downloads",
      "nav.label": "Sections",
      "nav.tool": "Tool",
      "nav.home": "Identity",
      theme: "Theme",
      title: "Download Falta",
      lead: "Pick a browser or a system. The link is always the latest build, and every new push on GitHub updates that same file.",
      browsers: "Browsers",
      systems: "Your computer",
      dl: "Download",
      open: "Open the tool",
      "file.chromium": "File: falta-chromium.zip",
      "file.firefox": "File: falta-firefox.zip",
      "file.win": "File: falta-windows.zip",
      "file.ubuntu": "File: falta-ubuntu.zip",
      "file.mac": "File: falta-macos.zip",
      "file.safari": "Safari has no extension file",
      "chrome.1": "Download the file and unzip it.",
      "chrome.2": "Open chrome://extensions",
      "chrome.3": "Turn on developer mode.",
      "chrome.4": "Load unpacked, and choose the folder that contains manifest.json.",
      "edge.1": "Download the same file and unzip it.",
      "edge.2": "Open edge://extensions",
      "edge.3": "Turn on developer mode.",
      "edge.4": "Load unpacked, and choose the folder that contains manifest.json.",
      "brave.1": "Download the same file and unzip it.",
      "brave.2": "Open brave://extensions",
      "brave.3": "Turn on developer mode.",
      "brave.4": "Load unpacked, and choose the folder that contains manifest.json.",
      "opera.1": "Download the same file and unzip it.",
      "opera.2": "Open opera://extensions",
      "opera.3": "Turn on developer mode.",
      "opera.4": "Load unpacked, and choose the folder that contains manifest.json.",
      "vivaldi.1": "Download the same file and unzip it.",
      "vivaldi.2": "Open vivaldi://extensions",
      "vivaldi.3": "Turn on developer mode.",
      "vivaldi.4": "Load unpacked, and choose the folder that contains manifest.json.",
      "firefox.1": "Download the file and unzip it.",
      "firefox.2": "Open about:debugging",
      "firefox.3": "This Firefox, then Load Temporary Add-on.",
      "firefox.4": "Choose manifest.json. The add-on disappears when Firefox closes.",
      "safari.1": "Safari cannot load the extension folder.",
      "safari.2": "Open the tool page in Safari.",
      "safari.3": "Paste the text and press flip. The conversion happens on the page.",
      "win.1": "Download the file and unzip it into a folder you will keep.",
      "win.2": "For the extension: in Chrome or Edge, load the extension folder inside it.",
      "win.3": "To open at startup, from that folder:",
      "win.4": "powershell -ExecutionPolicy Bypass -File scripts\\startup\\install-windows.ps1",
      "ubuntu.1": "Download the file and unzip it into a folder you will keep.",
      "ubuntu.2": "For the extension: load the extension folder from the browser.",
      "ubuntu.3": "To open at login:",
      "ubuntu.4": "sh scripts/startup/install-linux.sh",
      "mac.1": "Download the file and unzip it into a folder you will keep.",
      "mac.2": "For the extension: load the extension folder from the browser.",
      "mac.3": "The shortcut is Command+Shift+Y. To open at login:",
      "mac.4": "sh scripts/startup/install-macos.sh"
    }
  };

  var lang = localStorage.getItem("falta-lang") === "en" ? "en" : "ar";

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (STR[lang][key] != null) el.textContent = STR[lang][key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      if (STR[lang][key] != null) el.setAttribute("aria-label", STR[lang][key]);
    });
    document.getElementById("lang").textContent = lang === "ar" ? "EN" : "عربي";
    document.title = lang === "ar" ? "فلتة — التنزيل" : "Falta — download";
  }

  document.getElementById("lang").addEventListener("click", function () {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("falta-lang", lang);
    applyLang();
  });

  document.getElementById("theme").addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("falta-theme", next);
  });

  applyLang();
})();
