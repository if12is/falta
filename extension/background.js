var api = globalThis.chrome;

function menuTitle(lang) {
  return lang === "en" ? "Flip layout" : "اقلب التخطيط";
}

function ensureMenu() {
  api.storage.local.get({ lang: "ar" }, function (stored) {
    api.contextMenus.removeAll(function () {
      api.contextMenus.create({
        id: "flip",
        title: menuTitle(stored.lang),
        contexts: ["selection"]
      });
    });
  });
}

function flipTab(lamAlef) {
  api.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs && tabs[0];
    if (!tab || tab.id == null) return;
    api.tabs.sendMessage(tab.id, { type: "flip", lamAlef: lamAlef || null }, function () {
      if (!api.runtime.lastError) return;
      api.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["falta-core.js", "common.js", "content.js"]
      }, function () {
        if (api.runtime.lastError) return;
        api.tabs.sendMessage(tab.id, { type: "flip", lamAlef: lamAlef || null });
      });
    });
  });
}

api.runtime.onInstalled.addListener(ensureMenu);
api.runtime.onStartup.addListener(ensureMenu);
ensureMenu();

api.storage.onChanged.addListener(function (changes, area) {
  if (area === "local" && changes.lang) ensureMenu();
});

api.contextMenus.onClicked.addListener(function (info) {
  if (info.menuItemId === "flip") flipTab();
});

api.commands.onCommand.addListener(function (command) {
  if (command === "flip") flipTab();
});
