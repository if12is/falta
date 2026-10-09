# فلتة

فلتة تقلب الحروف بين تخطيط العربي والإنجليزي. مش ترجمة: كل حرف يرجع للمفتاح اللي طلع منه.

`;dt phg;` تبقى **كيف حالك**. الكاف هو مفتاح `;`، فالعلامة جزء من الجملة. `dt phg;` من غير الكاف تبقى «يف حالك».

التحويل يحصل على الجهاز. الإضافة مالهاش صلاحية شبكة، والنص ما يطلعش منها.

<img src="brand/mascot-128.png" width="112" height="112" alt="تميمة فلتة: قالب طباعة خزفي، حرف ع وحزام نحاس">

الأداة ليك ولصحابك. لسه مش على متاجر المتصفحات. أي حد يقدر يثبّتها من الريبو، أو يفتح الصفحة من غير إضافة.

الهوية: [`index.html`](index.html) — وعلى جيت هب بيجز: <https://if12is.github.io/falta/>

الأداة من غير تثبيت: [`web/index.html`](web/index.html)

## التثبيت

### على جهازك، وعلى جهاز أي حد

1. نزّل الريبو أو اعمل clone من <https://github.com/if12is/falta>.
2. افتح صفحة الإضافات.
3. فعّل وضع المطوّر.
4. اختار مجلد `extension` (مش جذر المشروع).

نفس المجلد على ويندوز ولينكس والماك.

| المتصفح | الصفحة | إيه تعمل |
| --- | --- | --- |
| كروم | `chrome://extensions` | Load unpacked. تفضل بعد إعادة التشغيل. |
| إيدج | `edge://extensions` | Load unpacked. |
| بريف | `brave://extensions` | Load unpacked. |
| أوبرا | `opera://extensions` | Load unpacked. |
| فيفالدي | `vivaldi://extensions` | Load unpacked. |
| فايرفوكس | `about:debugging#/runtime/this-firefox` | This Firefox، ثم Load Temporary Add-on، واختار `manifest.json`. الإضافة المؤقتة بتتشال لما فايرفوكس يقفل. |
| سفاري | — | المجلد مش بيتركّب. استخدم [`web/index.html`](web/index.html) أو زر الإشارة فيها. |

### النظام والاختصار واللوحة

الخطوات واحدة على ويندوز ولينكس والماك. الفرق في الاختصار واللوحة.

- ويندوز ولينكس: `Ctrl+Shift+X`
- الماك: `Command+Shift+X`
- اللوحة الافتراضية: **عربي ١٠١** (ويندوز، لينكس، وماك Arabic-PC).
- **عربي الماك** الأصلي إعداد ظاهر، لأن الصف السفلي مختلف: `z` عندهم ظ مش ئ.

تقدر تغيّر اختصار الصفحة من إعدادات فلتة، واختصار أمر المتصفح من صفحة اختصارات الإضافات.

### من غير إضافة

افتح [`web/index.html`](web/index.html) في أي متصفح، حتى سفاري. الصفحة تشتغل من الملف على جهازك. لو اتفتحت من جيت هب بيجز، الملفات بتتنزّل مرة، والتحويل بعد كده في المتصفح والنص مش بيتبعت.

من الطرفية، على أي نظام فيه Node 18 أو أحدث:

```bash
node cli/falta.mjs ";dt phg;"
node cli/falta.mjs --layout mac z
node cli/falta.mjs --split "لا"
```

بعد `node scripts/build.mjs` زر «اسحبني لشريط الإشارات» في الصفحة بيتحدّث لو غيّرت منطق القلب. النسخة الموجودة في الريبو شغالة من غير ما تبني.

### الاستخدام

- علّم النص في أي صفحة واضغط الاختصار، أو كليك يمين «اقلب التخطيط»، أو الزر الصغير جنب التحديد.
- من أيقونة فلتة: الصق، اقلب، انسخ. لو في تحديد في الصفحة، النافذة تجيبه.
- لو «لا» ليها قراءتين، زر البديل يبدّل بين مفتاح `b` ومفتاحين `gh` من غير نافذة توقفك.
- الزر العائم يتقفل من الإعدادات.
- السمة الغامقة من الزر، أو من إعدادات الإضافة: زي الجهاز / فاتح / غامق.

### تفتح مع تشغيل الجهاز

السكربتات بتضيف اختصار يفتح `web/index.html` لما تسجّل دخول. مش بتتنفّذ لوحدها، ومش بتلمس مجلد Startup غير لما تشغّلها. الصفحة تشتغل من `file://` ومن غير سيرفر.

ويندوز، من جذر الريبو:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\startup\install-windows.ps1
powershell -ExecutionPolicy Bypass -File scripts\startup\uninstall-windows.ps1
```

الماك:

```bash
sh scripts/startup/install-macos.sh
sh scripts/startup/uninstall-macos.sh
```

تثبيت الماك بيحط LaunchAgent في `~/Library/LaunchAgents/io.github.if12is.falta.plist` ويفتح الصفحة في تسجيل الدخول الجاي.

لينكس:

```bash
sh scripts/startup/install-linux.sh
sh scripts/startup/uninstall-linux.sh
```

تثبيت لينكس بيحط `~/.config/autostart/falta.desktop` (أو تحت `XDG_CONFIG_HOME`).

## الخصوصية

التحويل على الجهاز. الإضافة مالهاش صلاحية شبكة، ومش بتبعت النص. العداد المحلي بيعدّ المرات بس، ومش بيحفظ الكلام. عشان الزر العائم يشتغل في المواقع، سكربت المحتوى بيتسجّل على الصفحات؛ هو بيقرأ التحديد لما تطلب القلب.

بعض الصفحات، زي مستندات جوجل، بتمنع تعديل التحديد. فلتة تنسخ النتيجة وتقول كده، بدل ما تسكت.

## النشر للمتاجر

مش متسجلين على المتاجر، والتقديم محتاج حساباتك أنت. الخطوات بالتفصيل في [`docs/publish.md`](docs/publish.md).

تجهيز الحزم:

```bash
npm run pack
```

يطلع `dist/falta-chromium.zip` و`dist/falta-firefox.zip`. المجلد `dist/` مش داخل جيت، والأمر يعيد إنشاءه.

## التطوير

```bash
npm test
node scripts/build.mjs
npm run pack
```

الاختبارات تغطي الجملة، الحروف الكبيرة، أشكال الألف، لا وبديلها، الأرقام، والفرق بين `z` على ويندوز والماك. تباين الألوان متثبت في `tests/contrast.test.js`. قرارات الواجهة في [`docs/design.md`](docs/design.md).

الخطوط في `web/fonts` و`extension/fonts` تحت رخصة OFL. شوف `web/fonts/OFL.txt`.

## الرخصة

MIT. شوف `LICENSE`.

---

# Falta

Falta flips characters between the Arabic and English keyboard layouts. It is not a translation: each character goes back to the key it came from.

`;dt phg;` becomes **كيف حالك**. Kaf is the `;` key, so the semicolon is part of the sentence. `dt phg;` without it is «يف حالك».

Conversion stays on the device. The extension has no network permission, and the text does not leave it.

<img src="brand/mascot-128.png" width="112" height="112" alt="Falta, a ceramic type block with an ain and a copper band">

The tool is for you and your friends. It is not listed in a browser store. Anyone can install it from this repo, or open the page with no add-on.

Identity page: [`index.html`](index.html) — and on GitHub Pages: <https://if12is.github.io/falta/>

The tool, with nothing to install: [`web/index.html`](web/index.html)

## Install

### On your machines, and on anyone’s

1. Download the repo or clone <https://github.com/if12is/falta>.
2. Open the browser’s extensions page.
3. Turn on developer mode.
4. Choose the `extension` folder (not the repo root).

The same folder on Windows, Linux, and Mac.

| Browser | Page | What to do |
| --- | --- | --- |
| Chrome | `chrome://extensions` | Load unpacked. It stays after a restart. |
| Edge | `edge://extensions` | Load unpacked. |
| Brave | `brave://extensions` | Load unpacked. |
| Opera | `opera://extensions` | Load unpacked. |
| Vivaldi | `vivaldi://extensions` | Load unpacked. |
| Firefox | `about:debugging#/runtime/this-firefox` | This Firefox, then Load Temporary Add-on, and choose `manifest.json`. A temporary add-on disappears when Firefox closes. |
| Safari | — | The folder cannot be loaded. Use [`web/index.html`](web/index.html) or the bookmark button on that page. |

### System, shortcut, and layout

The steps are the same on Windows, Linux, and Mac. The shortcut and the layout choice are what change.

- Windows and Linux: `Ctrl+Shift+X`
- Mac: `Command+Shift+X`
- Default layout: **Arabic 101** (Windows, Linux, and Mac Arabic-PC).
- **Mac Arabic**, the native layout, is a setting, because the bottom row differs: their `z` is ظ, not ئ.

You can change the page shortcut in Falta’s settings, and the browser command from the extensions shortcuts page.

### Without an extension

Open [`web/index.html`](web/index.html) in any browser, including Safari. The page works from the file on your machine. If you open it from GitHub Pages, the files download once; after that the flip runs in the browser and the text is not sent.

From the terminal, on any system with Node 18 or newer:

```bash
node cli/falta.mjs ";dt phg;"
node cli/falta.mjs --layout mac z
node cli/falta.mjs --split "لا"
```

`node scripts/build.mjs` refreshes the “drag me to the bookmarks bar” button if you change the flip logic. The copy already in the repo works without a build.

### Use

- Select text on any page and press the shortcut, or right-click “flip the layout”, or use the small button beside the selection.
- From the Falta icon: paste, flip, copy. If the page has a selection, the popup picks it up.
- When لا has two readings, the alternative button switches between the `b` key and the two keys `gh`, without a blocking dialog.
- The floating button can be turned off in settings.
- Dark theme is the button, or the extension settings: match the device / light / dark.

### Open at login

The scripts add a shortcut that opens `web/index.html` when you sign in. They do not run by themselves, and they do not touch the Startup folder until you run them. The page works from `file://` with no server.

Windows, from the repo root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\startup\install-windows.ps1
powershell -ExecutionPolicy Bypass -File scripts\startup\uninstall-windows.ps1
```

Mac:

```bash
sh scripts/startup/install-macos.sh
sh scripts/startup/uninstall-macos.sh
```

The Mac install writes a LaunchAgent at `~/Library/LaunchAgents/io.github.if12is.falta.plist` and opens the page at the next login.

Linux:

```bash
sh scripts/startup/install-linux.sh
sh scripts/startup/uninstall-linux.sh
```

The Linux install writes `~/.config/autostart/falta.desktop` (or under `XDG_CONFIG_HOME`).

## Privacy

Conversion stays on the device. The extension has no network permission and does not send the text. The local counter only counts flips; it does not keep the words. For the floating button to work on sites, a content script is registered on pages; it reads the selection when you ask for a flip.

Some pages, such as Google Docs, refuse to edit the selection. Falta copies the result and says so, instead of failing quietly.

## Publishing to the stores

It is not listed, and submitting needs your own store accounts. The steps are in [`docs/publish.md`](docs/publish.md).

Build the packages:

```bash
npm run pack
```

That writes `dist/falta-chromium.zip` and `dist/falta-firefox.zip`. The `dist/` folder is not committed, and the command recreates it.

## Development

```bash
npm test
node scripts/build.mjs
npm run pack
```

Tests cover the sentence, capitals, alef forms, lam-alef and its alternative, digits, and the difference between `z` on Windows and Mac. Contrast is pinned in `tests/contrast.test.js`. Interface decisions are in [`docs/design.md`](docs/design.md).

Fonts in `web/fonts` and `extension/fonts` are OFL. See `web/fonts/OFL.txt`.

## License

MIT. See `LICENSE`.
