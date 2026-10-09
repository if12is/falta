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
  var lastField = null;
  var clickSnapshot = null;
  var holding = false;
  var dragging = false;
  var mascotApi = null;
  var mascotPromise = null;
  var SIZE = 96;

  var CSS = [
    ":host{all:initial}",
    ".btn{position:fixed;width:96px;height:96px;padding:0;border:0;border-radius:0;background:transparent;box-shadow:none;cursor:pointer;pointer-events:auto;display:block}",
    ".btn[hidden]{display:none !important}",
    ".btn canvas{width:100%;height:100%;display:block;pointer-events:none;background:transparent}",
    ".btn:active{transform:scale(.96)}",
    ".btn.is-loading{color:transparent}",
    ".btn.is-loading::after{content:'';position:absolute;left:18px;right:18px;bottom:10px;height:3px;background:#d4a684;transform:scaleX(0);transform-origin:left center;animation:falta-wipe 480ms linear infinite}",
    ".btn.is-error{animation:falta-shake 360ms cubic-bezier(.2,.8,.2,1)}",
    ".btn:disabled{opacity:.45;cursor:not-allowed;transform:none}",
    ".toast{position:fixed;max-width:min(320px,calc(100vw - 24px));display:flex;gap:8px;align-items:center;padding:12px;background:#fffcf7;color:#241c16;border:1px solid #c9b79f;border-top:4px solid #944c2c;border-radius:14px;font:15px/1.4 'IBM Plex Sans Arabic','Segoe UI',Tahoma,sans-serif;pointer-events:auto;box-shadow:0 8px 0 rgba(36,28,22,.04)}",
    ".toast[hidden]{display:none !important}",
    ".toast[data-kind='err']{border-top-color:#9e342c}",
    ".toast[data-kind='ok']{border-top-color:#2f6a34}",
    ".toast button{min-height:44px;border:0;background:transparent;color:#552a18;text-decoration:underline;cursor:pointer;font:inherit}",
    ":host([data-theme='dark']) .toast{background:#221c18;color:#f7f3ec;border-color:#4a3d32}",
    ":host([data-theme='dark']) .toast button{color:#e7c3a4}",
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
    var canvas = document.createElement("canvas");
    canvas.className = "mascot-canvas";
    canvas.width = 192;
    canvas.height = 192;
    canvas.setAttribute("aria-hidden", "true");
    button.appendChild(canvas);
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
    button.addEventListener("mousedown", function (event) {
      event.preventDefault();
      holding = true;
      var selected = readSelection(false);
      clickSnapshot = hasText(selected) ? selected : readRemembered();
    }, true);
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

  function hasText(info) {
    return !!(info && info.text && String(info.text).trim());
  }

  function isOurs(node) {
    if (!node || !host) return false;
    var el = node.nodeType === 1 ? node : node.parentElement;
    return !!(el && (el === host || host.contains(el)));
  }

  function deepActive() {
    var el = document.activeElement;
    var guard = 0;
    while (el && el.shadowRoot && el.shadowRoot.activeElement && guard < 6) {
      el = el.shadowRoot.activeElement;
      guard += 1;
    }
    return el;
  }

  function isTextField(el) {
    if (!el || !el.tagName || isOurs(el)) return false;
    if (el.tagName === "TEXTAREA") return true;
    if (el.tagName !== "INPUT") return false;
    var type = (el.type || "text").toLowerCase();
    return type === "text" || type === "search" || type === "url" || type === "email" || type === "password" || type === "";
  }

  function editableRoot(el) {
    if (!el || isOurs(el)) return null;
    if (el.nodeType === 3) el = el.parentElement;
    if (!el || !el.closest || !el.isContentEditable) return null;
    return el.closest("[contenteditable]") || el;
  }

  function remember(el) {
    if (isTextField(el)) lastField = el;
    else {
      var editable = editableRoot(el);
      if (editable) lastField = editable;
    }
  }

  function selectionRange(el) {
    try {
      if (el.selectionStart == null || el.selectionEnd == null) return null;
      return { start: el.selectionStart, end: el.selectionEnd };
    } catch (err) {
      return null;
    }
  }

  function readField(el, whole) {
    if (!isTextField(el) || !el.isConnected) return null;
    var value = el.value || "";
    var range = selectionRange(el);
    if (range && range.start !== range.end) {
      return {
        text: value.slice(range.start, range.end),
        field: el,
        start: range.start,
        end: range.end,
        selected: true
      };
    }
    if (whole && value.trim()) {
      return { text: value, field: el, start: 0, end: value.length, selected: false };
    }
    return null;
  }

  function readWindowSelection() {
    var sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed || isOurs(sel.anchorNode)) return null;
    var text = sel.toString();
    if (!text || !text.trim()) return null;
    var info = { text: text, selection: sel, selected: true };
    try {
      info.range = sel.getRangeAt(0).cloneRange();
    } catch (err) {
      info.range = null;
    }
    var node = sel.anchorNode;
    var el = node && (node.nodeType === 1 ? node : node.parentElement);
    var editable = editableRoot(el);
    if (editable) info.editable = editable;
    return info;
  }

  function readWholeEditable(el) {
    var editable = editableRoot(el);
    if (!editable || !editable.isConnected) return null;
    var text = editable.innerText || editable.textContent || "";
    if (!text.trim()) return null;
    return { text: text, editable: editable, whole: true, selected: false };
  }

  function readSelection(whole) {
    var active = deepActive();
    remember(active);
    var field = readField(active, false);
    if (field) return field;
    var win = readWindowSelection();
    if (win) return win;
    if (!whole) return { text: "" };
    field = readField(active, true);
    if (field) return field;
    var editable = readWholeEditable(active);
    if (editable) return editable;
    return { text: "" };
  }

  function readRemembered() {
    var live = readSelection(true);
    if (hasText(live)) return live;
    if (!lastField || !lastField.isConnected || isOurs(lastField)) return { text: "" };
    return readField(lastField, true) || readWholeEditable(lastField) || { text: "" };
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

  function setNativeValue(field, next) {
    var proto = field.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    var desc = Object.getOwnPropertyDescriptor(proto, "value");
    if (desc && desc.set) desc.set.call(field, next);
    else field.value = next;
  }

  function replaceField(info, next) {
    var field = info.field;
    try { field.focus(); } catch (err) { /* the page may reject focus */ }
    try {
      if (info.start != null && typeof field.setRangeText === "function") {
        field.setRangeText(next, info.start, info.end, "end");
      } else {
        setNativeValue(field, next);
      }
    } catch (err) {
      setNativeValue(field, next);
    }
    field.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }

  function replaceEditable(info, next) {
    if (info.whole && info.editable) {
      try { info.editable.focus(); } catch (err) { /* keep going */ }
      var all = window.getSelection();
      if (all) {
        var everything = document.createRange();
        everything.selectNodeContents(info.editable);
        all.removeAllRanges();
        all.addRange(everything);
        try {
          if (document.execCommand("insertText", false, next)) return true;
        } catch (err) { /* fall through */ }
      }
      info.editable.textContent = next;
      info.editable.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    var range = info.range;
    if (!range) {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
      var node = sel.anchorNode;
      var el = node && (node.nodeType === 1 ? node : node.parentElement);
      if (!editableRoot(el)) return false;
      try { range = sel.getRangeAt(0); } catch (err) { return false; }
    }
    try {
      range.deleteContents();
      range.insertNode(document.createTextNode(next));
      return true;
    } catch (err) {
      return false;
    }
  }

  function onScreen(rect) {
    if (!rect || (!rect.width && !rect.height)) return false;
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return false;
    if (rect.right <= 0 || rect.left >= window.innerWidth) return false;
    return true;
  }

  function measureFieldPoint(el, index) {
    var cs = getComputedStyle(el);
    var mirror = document.createElement("div");
    var props = ["fontFamily", "fontSize", "fontWeight", "fontStyle", "letterSpacing", "textTransform", "textIndent", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "boxSizing", "lineHeight", "textAlign", "wordSpacing"];
    mirror.style.position = "fixed";
    mirror.style.left = "0";
    mirror.style.top = "0";
    mirror.style.visibility = "hidden";
    mirror.style.pointerEvents = "none";
    mirror.style.whiteSpace = el.tagName === "INPUT" ? "pre" : "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.overflow = "hidden";
    mirror.style.width = Math.max(el.clientWidth, 1) + "px";
    props.forEach(function (prop) { mirror.style[prop] = cs[prop]; });
    mirror.appendChild(document.createTextNode((el.value || "").slice(0, index)));
    var mark = document.createElement("span");
    mark.textContent = "\u200b";
    mirror.appendChild(mark);
    document.documentElement.appendChild(mirror);
    var mirrorRect = mirror.getBoundingClientRect();
    var markRect = mark.getBoundingClientRect();
    mirror.remove();
    var fieldRect = el.getBoundingClientRect();
    var x = fieldRect.left + (markRect.left - mirrorRect.left) - el.scrollLeft;
    var y = fieldRect.top + (markRect.top - mirrorRect.top) - el.scrollTop;
    var line = parseFloat(cs.lineHeight);
    if (!line || !isFinite(line)) line = parseFloat(cs.fontSize) * 1.4 || fieldRect.height || 20;
    x = Math.min(fieldRect.right, Math.max(fieldRect.left, x));
    y = Math.min(Math.max(fieldRect.bottom - line, fieldRect.top), Math.max(fieldRect.top, y));
    return { left: x, top: y, right: x + 1, bottom: y + line, width: 1, height: line };
  }

  function selectionBox(info) {
    if (info.field && info.selected && info.end != null) {
      var point = measureFieldPoint(info.field, info.end);
      if (onScreen(point)) return point;
      var box = info.field.getBoundingClientRect();
      if (onScreen(box)) return box;
      return null;
    }
    var range = info.range;
    if (!range && info.selection && info.selection.rangeCount) {
      try { range = info.selection.getRangeAt(0); } catch (err) { range = null; }
    }
    if (range) {
      var rects = range.getClientRects();
      var rect = rects.length ? rects[rects.length - 1] : range.getBoundingClientRect();
      if (onScreen(rect)) return rect;
    }
    if (info.field) {
      var fieldBox = info.field.getBoundingClientRect();
      if (onScreen(fieldBox)) return fieldBox;
    }
    if (info.editable) {
      var editableBox = info.editable.getBoundingClientRect();
      if (onScreen(editableBox)) return editableBox;
    }
    return null;
  }

  function hideMascot() {
    if (!button) return;
    button.hidden = true;
    if (mascotApi) mascotApi.stop();
  }

  function ensureMascot() {
    if (mascotApi) return Promise.resolve(mascotApi);
    if (!mascotPromise) {
      mascotPromise = import(chrome.runtime.getURL("float-mascot.js")).then(function (mod) {
        if (button.hidden) {
          mascotPromise = null;
          return null;
        }
        mascotApi = mod.attach(button.querySelector("canvas"));
        if (!mascotApi) mascotPromise = null;
        return mascotApi;
      }).catch(function () {
        mascotPromise = null;
        return null;
      });
    }
    return mascotPromise;
  }

  function placeButton() {
    if (!settings.floating || !button) {
      hideMascot();
      return;
    }
    var info = readSelection(false);
    if (!hasText(info)) {
      hideMascot();
      return;
    }
    var rect = selectionBox(info);
    if (!rect) {
      hideMascot();
      return;
    }
    var anchor = info.field || info.editable || document.documentElement;
    var rtl = getComputedStyle(anchor).direction === "rtl";
    var gap = 6;
    var x = rtl ? rect.left - SIZE - gap : rect.right + gap;
    var y = rect.top + (rect.height - SIZE) / 2;
    if (x < 8 || x + SIZE > window.innerWidth - 8) {
      x = rtl ? rect.right + gap : rect.left - SIZE - gap;
    }
    if (y + SIZE > window.innerHeight - 8 || y < 8) {
      var above = rect.top - SIZE - gap;
      y = above >= 8 ? above : rect.bottom + gap;
    }
    x = Math.min(window.innerWidth - SIZE - 8, Math.max(8, x));
    y = Math.min(window.innerHeight - SIZE - 8, Math.max(8, y));
    button.style.left = x + "px";
    button.style.top = y + "px";
    button.hidden = false;
    button.setAttribute("aria-label", say("flip"));
    ensureMascot().then(function (api) {
      if (!api) return;
      if (button.hidden) api.stop();
      else api.start();
    });
  }

  async function applyKnown(original, mode, previous) {
    var result = globalThis.FaltaCore.convertText(original, {
      layout: settings.layout,
      lamAlef: mode
    });
    var replaced = false;
    if (previous && previous.field && previous.field.isConnected) {
      var value = previous.field.value;
      var at = value.indexOf(previous.output);
      if (at !== -1) {
        previous.field.setRangeText(result.text, at, at + previous.output.length, "end");
        previous.field.dispatchEvent(new Event("input", { bubbles: true }));
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
    else if (copied) showToast("err", say("blocked"), result.alternatives);
    else showToast("err", say("blockedFail"), false);
    markButton(replaced || copied ? "is-success" : "is-error");
  }

  function markButton(cls) {
    if (!button) return;
    button.classList.remove("is-loading", "is-success", "is-error");
    if (!cls) return;
    button.classList.add(cls);
    setTimeout(function () { button.classList.remove(cls); }, 700);
  }

  function textForFlip() {
    var live = readSelection(false);
    if (hasText(live)) {
      clickSnapshot = null;
      return live;
    }
    if (hasText(clickSnapshot)) {
      var snap = clickSnapshot;
      clickSnapshot = null;
      return snap;
    }
    return readSelection(true);
  }

  async function flipSelection(forcedMode) {
    var now = Date.now();
    if (now - lastAt < 700) {
      clickSnapshot = null;
      return { skipped: true };
    }
    lastAt = now;
    var info = textForFlip();
    if (!hasText(info)) {
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
    else replaced = replaceEditable(info, result.text);
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
      if (settings.floating === false) hideMascot();
    }).catch(function () {});
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== "local") return;
      Object.keys(changes).forEach(function (key) { settings[key] = changes[key].newValue; });
      paintTheme();
      if (changes.floating && settings.floating === false) hideMascot();
    });
    document.addEventListener("mousedown", function (event) {
      if (event.target === host) return;
      dragging = true;
    }, true);
    document.addEventListener("mouseup", function () {
      holding = false;
      dragging = false;
      setTimeout(placeButton, 0);
    }, true);
    document.addEventListener("keyup", function () { setTimeout(placeButton, 0); }, true);
    document.addEventListener("selectionchange", function () {
      if (holding || dragging) return;
      setTimeout(placeButton, 30);
    });
    var scrollTick = false;
    window.addEventListener("scroll", function () {
      if (scrollTick || !button || button.hidden) return;
      scrollTick = true;
      requestAnimationFrame(function () {
        scrollTick = false;
        placeButton();
      });
    }, true);
    document.addEventListener("keydown", function (event) {
      if (!matchesShortcut(event)) return;
      event.preventDefault();
      event.stopPropagation();
      flipSelection(null);
    }, true);
    chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
      if (msg.type === "selection") {
        sendResponse({ text: readSelection(false).text || "" });
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
