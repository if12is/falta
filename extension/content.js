(function () {
  if (globalThis.__faltaLoaded) return;
  globalThis.__faltaLoaded = true;

  var settings = Object.assign({}, globalThis.FaltaUI.DEFAULTS);
  var lastAt = 0;
  var lastFlip = null;
  var host;
  var button;
  var toast;
  var altButton;
  var toastText;

  var CSS = [
    ":host{all:initial}",
    ".btn{position:fixed;width:44px;height:44px;padding:0;border:0;border-radius:8px;background:#552a18;box-shadow:0 2px 0 #3a1c10;cursor:pointer;pointer-events:auto;display:grid;place-items:center;transition:transform 140ms cubic-bezier(.2,.8,.2,1),box-shadow 140ms cubic-bezier(.2,.8,.2,1),background-color 140ms cubic-bezier(.2,.8,.2,1)}",
    ".btn img{width:28px;height:28px;border-radius:4px;pointer-events:none}",
    ".btn:active{transform:translateY(2px);box-shadow:0 0 0 #3a1c10;transition-duration:90ms}",
    ".btn.is-loading{color:transparent}",
    ".btn.is-loading::after{content:'';position:absolute;left:8px;right:8px;bottom:6px;height:3px;background:#d4a684;transform:scaleX(0);transform-origin:left center;animation:falta-wipe 480ms linear infinite}",
    ".btn.is-success{background:#2f6a34}",
    ".btn.is-error{background:#9e342c;animation:falta-shake 360ms cubic-bezier(.2,.8,.2,1)}",
    ".btn:disabled{opacity:.45;box-shadow:none;cursor:not-allowed;transform:none}",
    ".toast{position:fixed;max-width:min(320px,calc(100vw - 24px));display:flex;gap:8px;align-items:center;padding:12px;background:#fffcf7;color:#241c16;border:1px solid #c9b79f;border-top:4px solid #944c2c;border-radius:14px;font:15px/1.4 'IBM Plex Sans Arabic','Segoe UI',Tahoma,sans-serif;pointer-events:auto;box-shadow:0 8px 0 rgba(36,28,22,.04)}",
    ".toast[data-kind='err']{border-top-color:#9e342c}",
    ".toast[data-kind='ok']{border-top-color:#2f6a34}",
    ".toast button{min-height:44px;border:0;background:transparent;color:#552a18;text-decoration:underline;cursor:pointer;font:inherit}",
    ":host([data-theme='dark']) .toast{background:#221c18;color:#f7f3ec;border-color:#4a3d32}",
    ":host([data-theme='dark']) .toast button{color:#e7c3a4}",
    ":host([data-theme='dark']) .btn{background:#e7c3a4;box-shadow:0 2px 0 #8c623e}",
    "@media (hover:hover){.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 3px 0 #3a1c10}}",
    "@media (prefers-reduced-motion:reduce){.btn,.toast{transition:none;animation:none}.btn:hover,.btn:active,.btn.is-error{transform:none}.btn.is-loading::after{animation:none;transform:scaleX(1)}}",
    "@keyframes falta-wipe{to{transform:scaleX(1)}}",
    "@keyframes falta-shake{0%,100%{transform:translateX(0)}30%{transform:translateX(-4px)}70%{transform:translateX(4px)}}"
  ].join("");

  function lang() { return settings.lang === "en" ? "en" : "ar"; }
  function say(key) { return globalThis.FaltaUI.t(lang(), key); }

  function mount() {
    host = document.createElement("div");
    host.id = "falta-host";
    host.style.cssText = "position:fixed;inset:0;z-index:2147483646;pointer-events:none";
    var shadow = host.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent = CSS;
    button = document.createElement("button");
    button.type = "button";
    button.className = "btn";
    button.hidden = true;
    button.innerHTML = "<img alt=''>";
    button.querySelector("img").src = chrome.runtime.getURL("icons/icon32.png");
    toast = document.createElement("div");
    toast.className = "toast";
    toast.hidden = true;
    toast.setAttribute("role", "status");
    toastText = document.createElement("span");
    altButton = document.createElement("button");
    altButton.type = "button";
    altButton.hidden = true;
    toast.append(toastText, altButton);
    shadow.append(style, button, toast);
    (document.documentElement || document.body).appendChild(host);
    button.addEventListener("mousedown", function (event) { event.preventDefault(); });
    button.addEventListener("click", function () { flipSelection(null); });
    altButton.addEventListener("click", function () {
      if (!lastFlip) return;
      var next = lastFlip.lamAlef === "single" ? "split" : "single";
      applyKnown(lastFlip.original, next, lastFlip);
    });
  }

  function paintTheme() {
    if (!host) return;
    host.setAttribute("data-theme", globalThis.FaltaUI.resolveTheme(settings.theme));
  }

  function showToast(kind, message, alternative) {
    toast.hidden = false;
    toast.dataset.kind = kind;
    toastText.textContent = message;
    altButton.hidden = !alternative;
    altButton.textContent = alternative ? say(lastFlip && lastFlip.lamAlef === "split" ? "altSingle" : "altSplit") : "";
    var width = 300;
    toast.style.left = Math.max(8, (window.innerWidth - width) / 2) + "px";
    toast.style.bottom = "16px";
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.hidden = true; }, alternative ? 6000 : 2400);
  }

  function readSelection() {
    var el = document.activeElement;
    if (el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && /^(text|search|url|email|password)?$/i.test(el.type || "text")))) {
      if (el.selectionStart != null && el.selectionStart !== el.selectionEnd) {
        return { text: el.value.slice(el.selectionStart, el.selectionEnd), field: el, start: el.selectionStart, end: el.selectionEnd };
      }
    }
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return { text: "" };
    return { text: sel.toString(), selection: sel };
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    try {
      var area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch (err) {
      return false;
    }
  }

  function replaceField(info, next) {
    info.field.setRangeText(next, info.start, info.end, "end");
    info.field.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }

  function replaceEditable(next) {
    var sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    var node = sel.anchorNode;
    var el = node && (node.nodeType === 1 ? node : node.parentElement);
    var editable = el && el.closest && el.closest("[contenteditable=''],[contenteditable='true']");
    if (!editable) return false;
    try {
      var range = sel.getRangeAt(0);
      range.deleteContents();
      var textNode = document.createTextNode(next);
      range.insertNode(textNode);
      return true;
    } catch (err) {
      return false;
    }
  }

  function placeButton() {
    if (!settings.floating || !button) {
      if (button) button.hidden = true;
      return;
    }
    var info = readSelection();
    if (!info.text || !info.text.trim()) {
      button.hidden = true;
      return;
    }
    var rect = null;
    if (info.field && info.field.getBoundingClientRect) rect = info.field.getBoundingClientRect();
    else if (info.selection && info.selection.rangeCount) rect = info.selection.getRangeAt(0).getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) {
      button.hidden = true;
      return;
    }
    var rtl = getComputedStyle(document.documentElement).direction === "rtl";
    var x = (rtl ? rect.left : rect.right) - 22;
    var y = rect.bottom + 8;
    x = Math.min(window.innerWidth - 52, Math.max(8, x));
    y = Math.min(window.innerHeight - 52, Math.max(8, y));
    button.style.left = x + "px";
    button.style.top = y + "px";
    button.hidden = false;
    button.setAttribute("aria-label", say("flip"));
  }

  async function applyKnown(original, mode, previous) {
    var result = globalThis.FaltaCore.convertText(original, {
      layout: settings.layout,
      lamAlef: mode
    });
    var replaced = false;
    if (previous && previous.field && document.contains(previous.field)) {
      var value = previous.field.value;
      var at = value.indexOf(previous.output);
      if (at !== -1) {
        previous.field.setRangeText(result.text, at, at + previous.output.length, "end");
        replaced = true;
      }
    }
    var copied = await copyText(result.text);
    lastFlip = {
      original: original,
      output: result.text,
      lamAlef: mode,
      field: previous && previous.field
    };
    if (replaced) showToast("ok", say("flipped"), result.alternatives);
    else if (copied) showToast(replaced ? "ok" : "err", say("blocked"), result.alternatives);
    else showToast("err", say("blockedFail"), false);
    markButton(replaced || copied ? "is-success" : "is-error");
  }

  function markButton(cls) {
    button.classList.remove("is-loading", "is-success", "is-error");
    if (!cls) return;
    button.classList.add(cls);
    setTimeout(function () { button.classList.remove(cls); }, 700);
  }

  async function flipSelection(forcedMode) {
    var now = Date.now();
    if (now - lastAt < 700) return { skipped: true };
    lastAt = now;
    var info = readSelection();
    if (!info.text || !info.text.trim()) {
      showToast("err", say("empty"), false);
      markButton("is-error");
      return { ok: false, reason: "empty" };
    }
    var mode = forcedMode || settings.lamAlef || "single";
    var result = globalThis.FaltaCore.convertText(info.text, {
      layout: settings.layout,
      lamAlef: mode
    });
    var replaced = false;
    if (info.field) replaced = replaceField(info, result.text);
    else replaced = replaceEditable(result.text);
    var copied = await copyText(result.text);
    lastFlip = {
      original: info.text,
      output: result.text,
      lamAlef: mode,
      field: info.field || null
    };
    globalThis.FaltaUI.bumpStats().catch(function () {});
    if (replaced) showToast("ok", say("flipped"), result.alternatives);
    else if (copied) showToast("err", say("blocked"), result.alternatives);
    else showToast("err", say("blockedFail"), false);
    markButton(replaced || copied ? "is-success" : "is-error");
    return {
      ok: replaced,
      reason: replaced ? "ok" : (copied ? "blocked" : "error"),
      text: result.text,
      alternatives: result.alternatives
    };
  }

  function matchesShortcut(event) {
    var key = (event.key || "").toLowerCase();
    if (settings.shortcutCustom && settings.shortcut) {
      var s = settings.shortcut;
      return key === s.key && event.ctrlKey === !!s.ctrl && event.shiftKey === !!s.shift && event.altKey === !!s.alt && event.metaKey === !!s.meta;
    }
    return key === "y" && event.shiftKey && (event.ctrlKey || event.metaKey) && !event.altKey;
  }

  function boot() {
    if (!document.documentElement) return;
    mount();
    globalThis.FaltaUI.loadSettings().then(function (stored) {
      settings = stored;
      paintTheme();
    }).catch(function () {});
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== "local") return;
      Object.keys(changes).forEach(function (key) { settings[key] = changes[key].newValue; });
      paintTheme();
      if (changes.floating && settings.floating === false) button.hidden = true;
    });
    document.addEventListener("mouseup", function () { setTimeout(placeButton, 0); }, true);
    document.addEventListener("keyup", function () { setTimeout(placeButton, 0); }, true);
    document.addEventListener("selectionchange", function () { setTimeout(placeButton, 30); });
    window.addEventListener("scroll", function () { if (button) button.hidden = true; }, true);
    document.addEventListener("keydown", function (event) {
      if (!matchesShortcut(event)) return;
      event.preventDefault();
      event.stopPropagation();
      flipSelection(null);
    }, true);
    chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
      if (msg.type === "selection") {
        sendResponse({ text: readSelection().text || "" });
        return;
      }
      if (msg.type === "flip") {
        flipSelection(msg.lamAlef).then(sendResponse);
        return true;
      }
    });
  }

  boot();
})();
