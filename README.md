# فلتة

فلتة تقلب الحروف بين تخطيط العربي والإنجليزي. مش ترجمة: كل حرف يرجع للمفتاح اللي طلع منه.

`;dt phg;` تبقى **كيف حالك**. الكاف هو مفتاح `;`، فالعلامة جزء من الجملة. `dt phg;` من غير الكاف تبقى «يف حالك».

التحويل يحصل على الجهاز. الإضافة مالهاش صلاحية شبكة، والنص ما يطلعش منها.

<img src="brand/mascot-128.png" width="112" height="112" alt="تميمة فلتة: قالب طباعة خزفي، حرف ع وحزام نحاس">

الأداة ليك ولصحابك. صفحة التنزيل، بأيقونة كل متصفح ونظام وخطواته: <https://if12is.github.io/falta/download.html>

ملفات آخر ريليز، من غير ما تنسخ الريبو: <https://github.com/if12is/falta/releases/latest>

كل رفع على فرع `master` ينشر ريليز جديد ويرفع رقم الإصدار خانة: `v1.0.0` ثم `v1.0.1` وهكذا. الملفات الخمسة تتحدث مع بعض.

الهوية: [`index.html`](index.html) — وعلى جيت هب بيجز: <https://if12is.github.io/falta/>

الأداة من غير تثبيت: [`web/index.html`](web/index.html)

## التنزيل

من <https://github.com/if12is/falta/releases/latest> اختار ملف واحد.

| الملف | تنزّله امتى | تثبّته إزاي |
| --- | --- | --- |
| `falta-chromium.zip` | كروم، إيدج، بريف، أوبرا، أو فيفالدي، على ويندوز أو أوبونتو أو ماك | فك الضغط. افتح صفحة الإضافات، فعّل وضع المطوّر، واختار المجلد اللي طلع (جواه `manifest.json`). تفضل بعد إعادة التشغيل. |
| `falta-firefox.zip` | فايرفوكس | للتقديم على حساب المطوّر: ارفع الملف نفسه من غير فك ضغط. على جهازك دلوقتي: فك الضغط، ومن `about:debugging` اختار Load Temporary Add-on ثم `manifest.json`. النسخة المؤقتة بتتشال لما فايرفوكس يقفل. |
| `falta-windows.zip` | ويندوز، لو عايز تقلب النص في أي برنامج على الجهاز | فك الضغط في مجلد هتسيبه، مثلاً `Desktop\Falta`، وما تحذفوش. اضغط مرتين على `scripts\startup\install-windows.cmd`. بعد كده علّم النص واضغط `Ctrl+Shift+Y`. البرنامج يشتغل مع تشغيل ويندوز. أيقونة فلتة بتظهر جنب الساعة، ولو اتخبّت افتح السهم. |
| `falta-ubuntu.zip` | أوبونتو، لو عايز تقلب النص في أي برنامج | فك الضغط في مجلد هتسيبه وما تحذفوش. من المجلد: `sh scripts/startup/install-linux.sh`. بعد كده `Ctrl+Shift+Y`. يشتغل مع تسجيل الدخول. على Xorg الأيقونة في الشريط لو الجلسة بتظهرها، وعلى واي لاند مفيش أيقونة والإعدادات من قائمة البرامج. |
| `falta-macos.zip` | ماك، لو عايز تقلب النص في أي برنامج | فك الضغط في التنزيلات. ما تحذفوش وما تنقلوش. افتح Terminal من Command+Space، والصق `sh ~/Downloads/falta-macos/scripts/startup/install-macos.sh`. بعدها فعّل FaltaHotkey من Privacy & Security ثم Accessibility. بعد كده `Command+Shift+Y`. يشتغل مع تسجيل الدخول. أيقونة فلتة في شريط القائمة فوق. |

سفاري مش بيحمّل المجلد. بعد فك ضغط حزمة نظامك افتح `web/index.html`، أو افتح <https://if12is.github.io/falta/>.

الحزم الثلاثة دي برنامج على الجهاز، مش إضافة المتصفح. إضافة المتصفح قسم لوحده فوق، ولو عايزها جوه المتصفح بس. جوه كل حزمة ملف `INSTALL.txt` بنفس الخطوات. أوامر الإزالة مكتوبة هناك وفي قسم البرنامج على الجهاز تحت. Node 18 أو أحدث مطلوب، من <https://nodejs.org>. لو مش موجود، المثبّت يقف ويقول كده بالعربي والإنجليزي.

## التثبيت

### على جهازك، وعلى جهاز أي حد

لو نزّلت ريليز، ابدأ من جدول التنزيل فوق. الطريق ده بتاع اللي بيبني من المصدر:

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

- ويندوز ولينكس: `Ctrl+Shift+Y`
- الماك: `Command+Shift+Y`

`Ctrl+Shift+X` سيبه لفايرفوكس: هو بيقلب اتجاه السطر بس، مش الحروف.
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

### البرنامج على الجهاز

ده مش إضافة المتصفح. بعد التثبيت، علّم نص في أي برنامج واضغط الاختصار: `Ctrl+Shift+Y` على ويندوز وأوبونتو، و`Command+Shift+Y` على الماك. اللوحة عربي ١٠١، زي الإضافة، وتقدر تغيّرها من إعدادات البرنامج. لو مفيش نص متعلم، الحافظة ما تتمسحش. على ويندوز الأيقونة جنب الساعة، وعلى الماك في شريط القائمة، وعلى أوبونتو Xorg في الشريط لو الجلسة بتظهره، وعلى واي لاند مفيش أيقونة.

البرنامج يشتغل مع تسجيل الدخول، من المجلد اللي فكيت فيه الضغط. ما تحذفش المجلد ده. المثبّتات مش بتشتغل لوحدها.

ويندوز: اضغط مرتين على `scripts\startup\install-windows.cmd`. للإزالة: `scripts\startup\uninstall-windows.cmd`.

أوبونتو، من جذر المجلد:

```bash
sh scripts/startup/install-linux.sh
sh scripts/startup/uninstall-linux.sh
```

على واجهة واي لاند، المثبّت ممكن يطلب تثبيت `ydotool` ويطلب كلمة سر الجهاز. على Xorg بيكتفي بمكتبة `libxtst`.

الماك، بعد فك الضغط في التنزيلات. افتح Terminal: اضغط Command+Space، اكتب Terminal، واضغط Enter. الصق الأمر واضغط Enter:

```bash
sh ~/Downloads/falta-macos/scripts/startup/install-macos.sh
```

بعدها افتح System Settings ثم Privacy & Security ثم Accessibility، وفعّل `FaltaHotkey`.

للإزالة:

```bash
sh ~/Downloads/falta-macos/scripts/startup/uninstall-macos.sh
```

تثبيت الماك بيحط LaunchAgent في `~/Library/LaunchAgents/io.github.if12is.falta.plist` ويسيبه شغال بعد تسجيل الدخول.

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

The tool is for you and your friends. The download page, with a colored icon and steps for each browser and system: <https://if12is.github.io/falta/download.html>

The latest release files, with no need to clone: <https://github.com/if12is/falta/releases/latest>

Every push to `master` publishes a new release and bumps the patch number: `v1.0.0`, then `v1.0.1`, and so on. The five files update together.

Identity page: [`index.html`](index.html) — and on GitHub Pages: <https://if12is.github.io/falta/>

The tool, with nothing to install: [`web/index.html`](web/index.html)

## Download

From <https://github.com/if12is/falta/releases/latest>, pick one file.

| File | When to download it | How to install |
| --- | --- | --- |
| `falta-chromium.zip` | Chrome, Edge, Brave, Opera, or Vivaldi, on Windows, Ubuntu, or Mac | Unzip. Open the extensions page, turn on developer mode, and choose the unzipped folder (the one that contains `manifest.json`). It stays after a restart. |
| `falta-firefox.zip` | Firefox | To submit on a developer account: upload the zip itself, still zipped. On your machine right now: unzip, then from `about:debugging` choose Load Temporary Add-on and `manifest.json`. A temporary add-on disappears when Firefox closes. |
| `falta-windows.zip` | Windows, when you want to flip text in any program | Unzip into a folder you will keep, for example `Desktop\Falta`, and do not delete it. Double-click `scripts\startup\install-windows.cmd`. Then select text and press `Ctrl+Shift+Y`. The program starts with Windows. A Falta icon appears by the clock; if it is hidden, open the arrow. |
| `falta-ubuntu.zip` | Ubuntu, when you want to flip text in any program | Unzip into a folder you will keep, and do not delete it. From that folder: `sh scripts/startup/install-linux.sh`. Then `Ctrl+Shift+Y`. It starts when you log in. On Xorg the icon is in the status area when the session can show it. On Wayland there is no tray icon, and settings are in the app menu. |
| `falta-macos.zip` | Mac, when you want to flip text in any program | Unzip into Downloads. Do not delete it or move it. Open Terminal with Command+Space, then paste `sh ~/Downloads/falta-macos/scripts/startup/install-macos.sh`. Then turn on FaltaHotkey in Privacy & Security, Accessibility. Then `Command+Shift+Y`. It starts when you log in. A Falta icon sits in the menu bar. |

Safari cannot load the folder. After unzipping your system package, open `web/index.html`, or open <https://if12is.github.io/falta/>.

Those three packages are a program on the computer, not the browser extension. The extension is its own section above, for people who only want it inside a browser. Each package includes `INSTALL.txt` with the same steps. Remove commands are in that file and in the program section below. Node 18 or newer is required, from <https://nodejs.org>. If it is missing, the installer stops and says so in Arabic and English.

## Install

### On your machines, and on anyone’s

If you downloaded a release, start from the table above. This path is for building from source:

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

- Windows and Linux: `Ctrl+Shift+Y`
- Mac: `Command+Shift+Y`

Leave `Ctrl+Shift+X` to Firefox. That shortcut only swaps the line direction, not the letters.
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

### Program on the computer

This is not the browser extension. After install, select text in any program and press the shortcut: `Ctrl+Shift+Y` on Windows and Ubuntu, `Command+Shift+Y` on a Mac. The layout starts as Arabic 101, the same as the extension, and the desktop settings can change it. If nothing is selected, the clipboard is left as it was. On Windows the icon is by the clock, on a Mac it is in the menu bar, on Ubuntu Xorg it is in the status area when the session can show it, and on Wayland there is no tray icon.

The program starts at login, from the folder you unzipped. Do not delete that folder. The installers do not run by themselves.

Windows: double-click `scripts\startup\install-windows.cmd`. To remove it: `scripts\startup\uninstall-windows.cmd`.

Ubuntu, from the unzipped folder:

```bash
sh scripts/startup/install-linux.sh
sh scripts/startup/uninstall-linux.sh
```

On a Wayland session the installer may install `ydotool` and ask for the computer password. On Xorg it uses `libxtst`.

Mac, after unzipping into Downloads. Open Terminal: press Command+Space, type Terminal, and press Enter. Paste the command and press Enter:

```bash
sh ~/Downloads/falta-macos/scripts/startup/install-macos.sh
```

Then open System Settings, Privacy & Security, Accessibility, and turn on `FaltaHotkey`.

To remove it:

```bash
sh ~/Downloads/falta-macos/scripts/startup/uninstall-macos.sh
```

The Mac install writes a LaunchAgent at `~/Library/LaunchAgents/io.github.if12is.falta.plist` and keeps it running after you log in.

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
