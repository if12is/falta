var ui = globalThis.FaltaUI;
var settings = Object.assign({}, ui.DEFAULTS);
var lamAlef = "single";
var timer = 0;

function say(key) { return ui.t(settings.lang, key); }

function paint() {
  document.documentElement.lang = settings.lang === "en" ? "en" : "ar";
  document.documentElement.dir = settings.lang === "en" ? "ltr" : "rtl";
  ui.applyTheme(settings.theme);
  document.getElementById("title").textContent = say("title");
  document.getElementById("lede").textContent = say("lede");
  document.getElementById("label").textContent = say("label");
  document.getElementById("source").placeholder = say("placeholder");
  document.getElementById("flip").textContent = say("flip");
  document.getElementById("copy").textContent = say("copy");
  document.getElementById("page").textContent = say("flipPage");
  document.getElementById("options").textContent = say("options");
  var layout = document.getElementById("layout");
  layout.innerHTML = "";
  ["windows", "mac"].forEach(function (value) {
    var option = document.createElement("option");
    option.value = value;
    option.textContent = value === "mac" ? say("layoutMac") : say("layoutWin");
    layout.appendChild(option);
  });
  layout.value = settings.layout === "mac" ? "mac" : "windows";
  var n = (settings.stats && settings.stats.flips) || 0;
  document.getElementById("stats").textContent = say("stats").replace("{n}", String(n));
}

function setStatus(kind, message) {
  var el = document.getElementById("status");
  el.dataset.kind = kind || "";
  el.textContent = message || "";
}

function reduced() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

async function convert(mode) {
  var button = document.getElementById("flip");
  var source = document.getElementById("source").value;
  if (!source.trim()) {
    button.classList.add("is-error");
    setStatus("err", say("empty"));
    document.getElementById("alt").hidden = true;
    clearTimeout(timer);
    timer = setTimeout(function () { button.classList.remove("is-error"); }, 400);
    return;
  }
  button.disabled = true;
  button.classList.remove("is-success", "is-error");
  button.classList.add("is-loading");
  if (!reduced()) await wait(160);
  lamAlef = mode;
  var result = globalThis.FaltaCore.convertText(source, {
    layout: document.getElementById("layout").value,
    lamAlef: lamAlef
  });
  document.getElementById("result").textContent = result.text;
  var alt = document.getElementById("alt");
  alt.hidden = !result.alternatives;
  alt.textContent = lamAlef === "single" ? say("altSplit") : say("altSingle");
  settings.layout = document.getElementById("layout").value;
  settings.stats = await ui.bumpStats();
  chrome.storage.local.set({ layout: settings.layout });
  button.classList.remove("is-loading");
  button.classList.add("is-success");
  button.disabled = false;
  setStatus("ok", say("flipped"));
  paint();
  clearTimeout(timer);
  timer = setTimeout(function () { button.classList.remove("is-success"); }, 700);
}

document.getElementById("flip").addEventListener("click", function () { convert("single"); });
document.getElementById("alt").addEventListener("click", function () {
  convert(lamAlef === "single" ? "split" : "single");
});
document.getElementById("copy").addEventListener("click", async function () {
  var text = document.getElementById("result").textContent;
  if (!text) { setStatus("err", say("copyEmpty")); return; }
  try {
    await navigator.clipboard.writeText(text);
    setStatus("ok", say("copied"));
  } catch (err) {
    setStatus("err", say("copyFail"));
  }
});
document.getElementById("layout").addEventListener("change", function (event) {
  settings.layout = event.target.value;
  chrome.storage.local.set({ layout: settings.layout });
});
document.getElementById("page").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs && tabs[0];
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { type: "flip" }, function (res) {
      if (chrome.runtime.lastError || !res) {
        setStatus("err", say("blockedFail"));
        return;
      }
      if (res.reason === "empty") setStatus("err", say("empty"));
      else if (res.reason === "blocked") setStatus("err", say("blocked"));
      else if (res.reason === "error") setStatus("err", say("blockedFail"));
      else setStatus("ok", say("flipped"));
      if (res.text) document.getElementById("result").textContent = res.text;
    });
  });
});
document.getElementById("options").addEventListener("click", function (event) {
  event.preventDefault();
  chrome.runtime.openOptionsPage();
});

ui.loadSettings().then(function (stored) {
  settings = stored;
  lamAlef = settings.lamAlef || "single";
  paint();
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs && tabs[0];
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { type: "selection" }, function (res) {
      if (chrome.runtime.lastError || !res || !res.text) return;
      if (!document.getElementById("source").value) document.getElementById("source").value = res.text;
    });
  });
});
