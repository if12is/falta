(function () {
  var STR = {
    ar: {
      skip: "للتنزيل",
      "nav.label": "الأقسام",
      "nav.tool": "الأداة",
      "nav.home": "الهوية",
      theme: "السمة",
      title: "نزّل فلتة",
      lead: "قسم المتصفحات إضافة جوه المتصفح بس. قسم الجهاز برنامج يشتغل في أي برنامج مفتوح. الرابط دايمًا آخر نسخة.",
      browsers: "المتصفحات",
      systems: "البرنامج على الجهاز",
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
      "win.1": "نزّل ملف falta-windows.zip.",
      "win.2": "فك الضغط في مجلد هتسيبه، مثلاً على سطح المكتب Desktop\\Falta. ما تحذفش المجلد ده.",
      "win.3": "اضغط مرتين على ملف التثبيت:",
      "win.cmd": "scripts\\startup\\install-windows.cmd",
      "win.4": "علّم أي نص في أي برنامج واضغط Ctrl+Shift+Y. فلتة هتشتغل مع تشغيل ويندوز. أيقونة فلتة جنب الساعة، ولو اتخبّت في السهم.",
      "ubuntu.1": "نزّل ملف falta-ubuntu.zip.",
      "ubuntu.2": "فك الضغط في مجلد هتسيبه، مثلاً على سطح المكتب Desktop/Falta. ما تحذفش المجلد ده.",
      "ubuntu.3": "من جوه المجلد، شغّل الأمر ده:",
      "ubuntu.cmd": "sh scripts/startup/install-linux.sh",
      "ubuntu.4": "علّم أي نص في أي برنامج واضغط Ctrl+Shift+Y. فلتة هتشتغل لما تسجّل دخول. على Xorg الأيقونة في الشريط لو الجلسة بتظهرها. على واي لاند مفيش أيقونة، والإعدادات من قائمة البرامج.",
      "mac.1": "نزّل ملف falta-macos.zip.",
      "mac.2": "فك الضغط. المجلد يفضل في التنزيلات باسم falta-macos. ما تحذفوش وما تنقلوش.",
      "mac.cmd": "sh ~/Downloads/falta-macos/scripts/startup/install-macos.sh",
      "mac.access": "بعدها افتح System Settings ثم Privacy & Security ثم Accessibility، وفعّل FaltaHotkey.",
      "mac.4": "علّم أي نص في أي برنامج واضغط Command+Shift+Y. فلتة هتشتغل لما تسجّل دخول. أيقونة فلتة في شريط القائمة فوق."
    },
    en: {
      skip: "Skip to downloads",
      "nav.label": "Sections",
      "nav.tool": "Tool",
      "nav.home": "Identity",
      theme: "Theme",
      title: "Download Falta",
      lead: "The browser section is an extension that works only inside the browser. The computer section is a program that works in every open app. The link is always the latest build.",
      browsers: "Browsers",
      systems: "Program on your computer",
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
      "win.1": "Download falta-windows.zip.",
      "win.2": "Unzip it into a folder you will keep, for example Desktop\\Falta. Do not delete that folder.",
      "win.3": "Double-click the installer:",
      "win.cmd": "scripts\\startup\\install-windows.cmd",
      "win.4": "Select text in any program and press Ctrl+Shift+Y. Falta starts with Windows. A Falta icon appears by the clock, or under the hidden-icons arrow.",
      "ubuntu.1": "Download falta-ubuntu.zip.",
      "ubuntu.2": "Unzip it into a folder you will keep, for example Desktop/Falta. Do not delete that folder.",
      "ubuntu.3": "From inside that folder, run:",
      "ubuntu.cmd": "sh scripts/startup/install-linux.sh",
      "ubuntu.4": "Select text in any program and press Ctrl+Shift+Y. Falta starts when you log in. On Xorg the icon is in the status area when the session can show it. On Wayland there is no tray icon, and settings are in the app menu.",
      "mac.1": "Download falta-macos.zip.",
      "mac.2": "Unzip it. The folder stays in Downloads, named falta-macos. Do not delete it or move it.",
      "mac.cmd": "sh ~/Downloads/falta-macos/scripts/startup/install-macos.sh",
      "mac.access": "Then open System Settings, Privacy & Security, Accessibility, and turn on FaltaHotkey.",
      "mac.4": "Select text in any program and press Command+Shift+Y. Falta starts when you log in. A Falta icon sits in the menu bar."
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
