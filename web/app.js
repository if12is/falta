(function () {
  var STR = {
    ar: {
      skip: "للأداة",
      "nav.label": "الأقسام",
      layoutLabel: "لوحة المفاتيح",
      "nav.tool": "الأداة",
      "nav.how": "الفكرة",
      "nav.install": "التثبيت",
      "nav.faq": "أسئلة",
      "nav.brand": "الهوية",
      theme: "السمة",
      eyebrow: "ليك ولصحابك، مش متجر",
      "hero.title": "الحروف فلتت منك؟",
      "hero.lede": "كتبت وإنت ناسي تغيّر اللغة. الصق اللي طلع، فلتة ترجّعه لتخطيط الكيبورد — عربي أو إنجليزي — من غير ما تكتب من الأول.",
      mascot: "تميمة فلتة: قالب طباعة صغير بيلف، عليه حرف ع وحزام نحاس",
      "mascot.hint": "حرّك المؤشر، أو ميل الجهاز",
      tilt: "اسمح بميل الجهاز",
      "tool.label": "النص اللي طلع غلط",
      "tool.placeholder": "الصق هنا، مثلاً ;dt phg;",
      "tool.flip": "اقلب النص",
      "tool.copy": "انسخ",
      "tool.altSingle": "جرّب البديل: لا كمفتاح واحد",
      "tool.altSplit": "جرّب البديل: لا كمفتاحين",
      "tool.alt": "جرّب البديل: لا كمفتاحين",
      "proof.label": "اللي نقدر نقوله بصدق",
      "proof.device": "يشتغل على جهازك فقط",
      "proof.net": "من غير نت ومن غير حساب",
      "proof.friends": "ليك وللي تبعتلهم الملف",
      "problem.title": "مش ترجمة. الحرف راجع لمفتاحه.",
      "problem.wrong": "اللي طلع",
      "problem.right": "المقصود",
      "problem.body": "لو الكيبورد كان إنجليزي وإنت ناوي عربي، كل حرف يتقلب لمقابله على لوحة عربي ١٠١. والعكس. الأرقام تفضل أرقام.",
      "f1.title": "اختصار في أي صفحة",
      "f1.body": "علّم النص واضغط Ctrl+Shift+X. على الماك Command+Shift+X. تقدر تغيّره من الإعدادات.",
      "f2.title": "زر صغير جنب التحديد",
      "f2.body": "يظهر لما تعلّم كلام، ويقف جنب إيدك. لو مضايقك، اقفله من الإعدادات.",
      "f3.title": "لوحتين، مش تخمين صامت",
      "f3.body": "عربي ١٠١ لويندوز ولينكس و«Arabic - PC» على الماك. عربي الماك الأصلي اختيار ظاهر، لأن الصف السفلي مختلف: z عندهم ظ مش ئ.",
      "f4.title": "النص ما بيسافرش",
      "f4.body": "مفيش سيرفر ومفيش إحصائيات بتتبعت. العداد المحلي جوا المتصفح بس، لو حابب تشوف قلبت كام مرة.",
      "f4.spec": "٠ طلبات شبكة",
      "ex.title": "مواقف، مش آراء ناس",
      "ex.note": "دي أمثلة استخدام، مش شهادات. مفيش أسماء متألفة.",
      "ex.stamp": "مثال",
      "ex1.body": "رسالة لصاحبك اتكتبت والكيبورد إنجليزي.",
      "ex2.body": "تعليق في الكود طلع حروف لاتيني وأنت كنت فاكره عربي.",
      "ex3.body": "على الماك بلوحة Arabic الأصلية، z مش نفس z بتاعة ويندوز.",
      price: "ببلاش. ليك ولصحابك.",
      "install.title": "ثبّتها مرة، على أي نظام",
      "install.lead": "نفس مجلد extension على ويندوز ولينكس والماك. الفرق بس صفحة الإضافات في المتصفح.",
      "install.chrome": "كروم، إيدج، بريف، أوبرا، فيفالدي: افتح صفحة الإضافات، فعّل وضع المطوّر، Load unpacked، واختار مجلد extension.",
      "install.firefox": "فايرفوكس: about:debugging ثم This Firefox ثم Load Temporary Add-on واختار manifest.json. الإضافة المؤقتة بتتشال لما المتصفح يقفل.",
      "install.safari": "سفاري: الإضافة مش بتركّب من غير أدوات أبل. افتح الصفحة دي، أو اسحب زر الإشارة لتحت.",
      "install.bookmark": "اسحبني لشريط الإشارات",
      "install.offline": "لو الإشارة مش جاهزة، الصفحة دي نفسها أداة كاملة من غير تثبيت.",
      "faq.title": "قبل ما تسأل صاحبك",
      q1: "النص بيطلع بره الجهاز؟",
      a1: "لأ. التحويل يحصل عندك. مفيش صلاحية شبكة في الإضافة، والنص مش بيتخزن — بس عدد المرات لو ساببها مفتوحة.",
      q2: "تشتغل على كروم وفايرفوكس؟",
      a2: "أيوه، وعلى المتصفحات المبنية على كروميوم. فايرفوكس بيحمّلها كإضافة مؤقتة لحد ما تقفل المتصفح. الصفحة دي وزر الإشارة يفضلوا شغالين.",
      q3: "وسغاري؟",
      a3: "سفاري مش بيقبل الإضافة دي من المجلد. استخدم الصفحة أو زر الإشارة. نفس الكلام على أي متصفح قافل الإضافات.",
      q4: "أنهي لوحة أختار؟",
      a4: "لو بتكتب عربي زي ويندوز، أو على الماك اخترت Arabic - PC، سيّب عربي ١٠١. لو على الماك اخترت Arabic من غير PC، حوّل لعربي الماك. الصف السفلي هو اللي بيتغير.",
      q5: "«لا» طلعت b أو gh؟",
      a5: "على عربي ١٠١ في مفتاح واحد بيكتب لا، وهو b. ولو كتبت لام وبعدين ألف يبقى gh. فلتة تبدأ بالمفتاح الواحد، وتسيب زر «البديل» لو عايز التانية. من غير ما تقف قدام نافذة.",
      foot: "فلتة أداة مستقلة ليك ولصحابك. MIT. الخطوط OFL جوا web/fonts.",
      empty: "الصق النص الأول.",
      flipped: "اتقلب.",
      copied: "اتنسخ.",
      copyFail: "النسخ ماتمشّ. علّم النتيجة وانسخها بإيدك.",
      copyEmpty: "لسه مفيش نتيجة تنسخها.",
      layoutWin: "عربي ١٠١",
      layoutMac: "عربي الماك"
    },
    en: {
      skip: "Skip to the tool",
      "nav.label": "Sections",
      layoutLabel: "Keyboard layout",
      "nav.tool": "Tool",
      "nav.how": "Idea",
      "nav.install": "Install",
      "nav.faq": "FAQ",
      "nav.brand": "Identity",
      theme: "Theme",
      eyebrow: "For you and friends, not a store",
      "hero.title": "The letters slipped?",
      "hero.lede": "You typed in the wrong keyboard layout. Paste it. Falta puts each character back on its key — Arabic or English — without retyping.",
      mascot: "Falta, a small tumbling letterpress sort with an ain and a copper band",
      "mascot.hint": "Move the pointer, or tilt the device",
      tilt: "Allow device tilt",
      "tool.label": "The text that came out wrong",
      "tool.placeholder": "Paste here, for example ;dt phg;",
      "tool.flip": "Flip text",
      "tool.copy": "Copy",
      "tool.altSingle": "Try the other reading: lam-alef as one key",
      "tool.altSplit": "Try the other reading: lam-alef as two keys",
      "tool.alt": "Try the other reading: lam-alef as two keys",
      "proof.label": "What we can say honestly",
      "proof.device": "Runs on your machine only",
      "proof.net": "No network and no account",
      "proof.friends": "For you and whoever you send the folder",
      "problem.title": "Not a translation. The letter goes back to its key.",
      "problem.wrong": "What came out",
      "problem.right": "What you meant",
      "problem.body": "If the keyboard was English and you meant Arabic, each character flips to its Arabic 101 key. And the other way. Digits stay digits.",
      "f1.title": "A shortcut on any page",
      "f1.body": "Select text and press Ctrl+Shift+X. On a Mac, Command+Shift+X. You can change it in settings.",
      "f2.title": "A small button by the selection",
      "f2.body": "It shows up when you select text and stays near your hand. Turn it off in settings if it bothers you.",
      "f3.title": "Two layouts, no silent guess",
      "f3.body": "Arabic 101 for Windows, Linux, and Mac Arabic-PC. Native Mac Arabic is an explicit choice, because the bottom row differs: their z is ظ, not ئ.",
      "f4.title": "The text does not travel",
      "f4.body": "No server and no stats sent anywhere. A local counter in the browser only, if you want to see how often you flipped.",
      "f4.spec": "0 network requests",
      "ex.title": "Situations, not reviews",
      "ex.note": "These are examples, not testimonials. No invented names.",
      "ex.stamp": "Example",
      "ex1.body": "A message to a friend, typed while the keyboard was still English.",
      "ex2.body": "A code comment came out in Latin letters when you meant Arabic.",
      "ex3.body": "On a Mac with the native Arabic layout, z is not the Windows z.",
      price: "Free. For you and your friends.",
      "install.title": "Install it once, on any system",
      "install.lead": "The same extension folder on Windows, Linux, and Mac. Only the browser’s extensions page changes.",
      "install.chrome": "Chrome, Edge, Brave, Opera, Vivaldi: open the extensions page, turn on developer mode, Load unpacked, and choose the extension folder.",
      "install.firefox": "Firefox: about:debugging, This Firefox, Load Temporary Add-on, and choose manifest.json. A temporary add-on goes away when Firefox closes.",
      "install.safari": "Safari: this add-on does not load from the folder without Apple’s tools. Open this page, or drag the bookmark button below.",
      "install.bookmark": "Drag me to the bookmarks bar",
      "install.offline": "If the bookmark is not ready, this page is already a full tool with nothing to install.",
      "faq.title": "Before you ask a friend",
      q1: "Does the text leave the machine?",
      a1: "No. Conversion happens locally. The extension has no network permission, and the text is not stored — only a count, if you leave that on.",
      q2: "Does it work in Chrome and Firefox?",
      a2: "Yes, and in Chromium browsers. Firefox loads it as a temporary add-on until you quit. This page and the bookmark keep working.",
      q3: "What about Safari?",
      a3: "Safari will not load this folder. Use this page or the bookmark. Same for any browser that blocks extensions.",
      q4: "Which layout do I pick?",
      a4: "If you type Arabic the Windows way, or you chose Arabic - PC on a Mac, leave Arabic 101. If you chose plain Arabic on a Mac, switch to Mac Arabic. The bottom row is what changes.",
      q5: "Why did لا become b or gh?",
      a5: "On Arabic 101 one key types لا: b. Lam then alef is gh. Falta starts with the single key and leaves an alternative button, without a blocking dialog.",
      foot: "Falta is an independent tool for you and your friends. MIT. OFL fonts live in web/fonts.",
      empty: "Paste some text first.",
      flipped: "Flipped.",
      copied: "Copied.",
      copyFail: "Copy failed. Select the result and copy it yourself.",
      copyEmpty: "Nothing to copy yet.",
      layoutWin: "Arabic 101",
      layoutMac: "Mac Arabic"
    }
  };

  var lang = localStorage.getItem("falta-lang") === "en" ? "en" : "ar";
  var lamAlef = "single";
  var lastOriginal = "";
  var timer = 0;

  function t(key) { return STR[lang][key] || STR.ar[key] || ""; }

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (STR[lang][key] != null) el.textContent = STR[lang][key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      var name = t(el.getAttribute("data-i18n-alt"));
      if (el.tagName === "IMG") el.setAttribute("alt", name);
      else el.setAttribute("aria-label", name);
    });
    document.getElementById("lang").textContent = lang === "ar" ? "EN" : "عربي";
    var layout = document.getElementById("layout");
    layout.options[0].textContent = t("layoutWin");
    layout.options[1].textContent = t("layoutMac");
    document.title = lang === "ar" ? "فلتة — الحروف فلتت منك؟" : "Falta — the letters slipped?";
  }

  function setStatus(kind, message) {
    var el = document.getElementById("status");
    el.dataset.kind = kind || "";
    el.textContent = message || "";
  }

  function wait(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  async function runFlip(mode) {
    var button = document.getElementById("flip");
    var source = document.getElementById("source").value;
    if (!source.trim()) {
      button.classList.remove("is-success", "is-loading");
      button.classList.add("is-error");
      setStatus("err", t("empty"));
      document.getElementById("alt").hidden = true;
      clearTimeout(timer);
      timer = setTimeout(function () { button.classList.remove("is-error"); }, 400);
      return;
    }
    button.disabled = true;
    button.classList.remove("is-success", "is-error");
    button.classList.add("is-loading");
    if (!reduced()) await wait(160);
    lamAlef = mode || lamAlef;
    lastOriginal = source;
    var result = globalThis.FaltaCore.convertText(source, {
      layout: document.getElementById("layout").value,
      lamAlef: lamAlef
    });
    document.getElementById("result").textContent = result.text;
    var alt = document.getElementById("alt");
    alt.hidden = !result.alternatives;
    alt.textContent = lamAlef === "single" ? t("tool.altSplit") : t("tool.altSingle");
    button.classList.remove("is-loading");
    button.classList.add("is-success");
    button.disabled = false;
    setStatus("ok", t("flipped"));
    clearTimeout(timer);
    timer = setTimeout(function () { button.classList.remove("is-success"); }, 700);
  }

  document.getElementById("tool").addEventListener("submit", function (event) {
    event.preventDefault();
    lamAlef = "single";
    runFlip("single");
  });

  document.getElementById("alt").addEventListener("click", function () {
    runFlip(lamAlef === "single" ? "split" : "single");
  });

  document.getElementById("copy").addEventListener("click", async function () {
    var text = document.getElementById("result").textContent;
    if (!text) {
      setStatus("err", t("copyEmpty"));
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setStatus("ok", t("copied"));
    } catch (err) {
      setStatus("err", t("copyFail"));
    }
  });

  document.getElementById("lang").addEventListener("click", function () {
    lang = lang === "ar" ? "en" : "ar";
    localStorage.setItem("falta-lang", lang);
    setStatus("", "");
    applyLang();
  });

  document.getElementById("theme").addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("falta-theme", next);
  });

  var bookmark = document.getElementById("bookmarklet");
  if (globalThis.FALTA_BOOKMARKLET) bookmark.href = globalThis.FALTA_BOOKMARKLET;

  var platform = globalThis.FaltaCore.detectPlatform();
  if (platform === "mac") {
    var note = document.createElement("p");
    note.id = "mac-note";
    note.className = "status";
    document.querySelector(".slip").appendChild(note);
  }

  var previousApply = applyLang;
  applyLang = function () {
    previousApply();
    var note = document.getElementById("mac-note");
    if (note) {
      note.textContent = lang === "en"
        ? "This Mac stays on Arabic 101 until you change the menu. Pick Mac Arabic only for the native layout."
        : "الماك لسه على عربي ١٠١ لحد ما تغيّر القائمة. عربي الماك بس لو بتستخدم التخطيط الأصلي.";
    }
  };

  applyLang();
})();
