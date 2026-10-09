(function () {
  if (globalThis.__faltaPanel) {
    globalThis.__faltaPanel.remove();
    globalThis.__faltaPanel = null;
    return;
  }
  var host = document.createElement("div");
  host.style.cssText = "all:initial;position:fixed;z-index:2147483646;inset:auto 12px 12px auto;width:min(320px,calc(100vw - 24px));font:15px/1.5 Tahoma,sans-serif";
  var root = host.attachShadow({ mode: "open" });
  root.innerHTML = "<style>div{background:#fffcf7;color:#241c16;border:1px solid #c9b79f;border-top:4px solid #944c2c;border-radius:14px;padding:12px;display:grid;gap:8px}textarea,button,select{font:inherit;min-height:44px}textarea{width:100%;box-sizing:border-box}button.flip{background:#552a18;color:#fbf6f1;border:0;border-radius:6px;box-shadow:0 2px 0 #3a1c10;cursor:pointer}button.flip:active{transform:translateY(2px);box-shadow:none}@media (prefers-reduced-motion:reduce){button.flip:active{transform:none}}</style><div><strong>فلتة</strong><textarea dir='auto' placeholder=';dt phg;'></textarea><button class='flip' type='button'>اقلب النص</button><select><option value='windows'>عربي ١٠١</option><option value='mac'>عربي الماك</option></select><p></p><button type='button' class='close'>قفل</button></div>";
  var box = root.querySelector("textarea");
  var out = root.querySelector("p");
  var flip = root.querySelector(".flip");
  flip.addEventListener("click", function () {
    var value = box.value;
    if (!value.trim()) { out.textContent = "الصق النص الأول."; return; }
    var result = globalThis.FaltaCore.convertText(value, { layout: root.querySelector("select").value });
    out.textContent = result.text;
    if (navigator.clipboard) navigator.clipboard.writeText(result.text).catch(function () {});
  });
  root.querySelector(".close").addEventListener("click", function () {
    host.remove();
    globalThis.__faltaPanel = null;
  });
  document.documentElement.appendChild(host);
  globalThis.__faltaPanel = host;
})();
