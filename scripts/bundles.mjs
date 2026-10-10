import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { zipDirectory } from "./pack.mjs";

const version = process.env.FALTA_VERSION || "1.0.0";

const bundles = [
  {
    name: "falta-windows",
    scripts: [
      "install-windows.ps1",
      "install-windows.cmd",
      "uninstall-windows.ps1",
      "uninstall-windows.cmd",
      "falta-hotkey.ps1",
      "falta-settings.ps1",
      "falta-win.ps1",
      "flip.mjs",
      "settings.mjs",
    ],
    system: "ويندوز",
    systemEn: "Windows",
    stepsAr: `1. فك الضغط في مجلد هتسيبه، مثلاً على سطح المكتب Desktop\\Falta. ما تحذفش المجلد ده، لأن البرنامج بيشتغل منه.
2. اضغط مرتين على scripts\\startup\\install-windows.cmd
3. لو ظهر إن Node مش موجود، نزّله 18 أو أحدث من https://nodejs.org وبعدين شغّل نفس الملف تاني.
4. علّم أي نص في أي برنامج واضغط Ctrl+Shift+Y. فلتة هتشتغل مع تشغيل ويندوز. أيقونة فلتة بتظهر جنب الساعة، ولو اتخبّت افتح السهم.
للإزالة: اضغط مرتين على scripts\\startup\\uninstall-windows.cmd`,
    stepsEn: `1. Unzip into a folder you will keep, for example Desktop\\Falta. Do not delete that folder. The program runs from it.
2. Double-click scripts\\startup\\install-windows.cmd
3. If it says Node is missing, install Node 18 or newer from https://nodejs.org and run the same file again.
4. Select text in any program and press Ctrl+Shift+Y. Falta starts with Windows. A Falta icon appears by the clock; if it is hidden, open the arrow.
To remove it, double-click scripts\\startup\\uninstall-windows.cmd`,
  },
  {
    name: "falta-ubuntu",
    scripts: [
      "install-linux.sh",
      "uninstall-linux.sh",
      "falta-hotkey.py",
      "flip.mjs",
      "settings.mjs",
    ],
    system: "أوبونتو",
    systemEn: "Ubuntu",
    stepsAr: `1. فك الضغط في مجلد هتسيبه. ما تحذفوش، لأن البرنامج بيشتغل منه.
2. من جوه المجلد شغّل: sh scripts/startup/install-linux.sh
3. لو ظهر إن Node مش موجود، نزّله 18 أو أحدث من https://nodejs.org وبعدين شغّل نفس الأمر تاني.
4. علّم أي نص في أي برنامج واضغط Ctrl+Shift+Y. فلتة هتشتغل لما تسجّل دخول. على Xorg الأيقونة في الشريط لو الجلسة بتظهرها. على واي لاند مفيش أيقونة، والإعدادات من قائمة البرامج باسم فلتة.
للإزالة: sh scripts/startup/uninstall-linux.sh`,
    stepsEn: `1. Unzip into a folder you will keep. Do not delete it. The program runs from it.
2. From inside that folder, run: sh scripts/startup/install-linux.sh
3. If it says Node is missing, install Node 18 or newer from https://nodejs.org and run the same command again.
4. Select text in any program and press Ctrl+Shift+Y. Falta starts when you log in. On Xorg the icon is in the status area when the session can show it. On Wayland there is no tray icon; settings are in the app menu under فلتة.
To remove it: sh scripts/startup/uninstall-linux.sh`,
  },
  {
    name: "falta-macos",
    scripts: [
      "install-macos.sh",
      "install-macos.command",
      "uninstall-macos.sh",
      "uninstall-macos.command",
      "falta-hotkey.swift",
      "flip.mjs",
      "settings.mjs",
    ],
    system: "ماك",
    systemEn: "Mac",
    stepsAr: `1. فك الضغط. المجلد يفضل في التنزيلات باسم falta-macos. ما تحذفوش وما تنقلوش، لأن البرنامج بيشتغل منه.
2. sh ~/Downloads/falta-macos/scripts/startup/install-macos.sh
3. لو ظهر إن Node مش موجود، نزّله 18 أو أحدث من https://nodejs.org وبعدين شغّل نفس الأمر تاني.
4. بعدها افتح System Settings ثم Privacy & Security ثم Accessibility، وفعّل FaltaHotkey.
5. علّم أي نص في أي برنامج واضغط Command+Shift+Y. فلتة هتشتغل لما تسجّل دخول. أيقونة فلتة في شريط القائمة فوق.
للإزالة: sh ~/Downloads/falta-macos/scripts/startup/uninstall-macos.sh`,
    stepsEn: `1. Unzip it. The folder stays in Downloads, named falta-macos. Do not delete it or move it. The program runs from it.
2. sh ~/Downloads/falta-macos/scripts/startup/install-macos.sh
3. If it says Node is missing, install Node 18 or newer from https://nodejs.org and run the same command again.
4. Then open System Settings, Privacy & Security, Accessibility, and turn on FaltaHotkey.
5. Select text in any program and press Command+Shift+Y. Falta starts when you log in. A Falta icon sits in the menu bar.
To remove it: sh ~/Downloads/falta-macos/scripts/startup/uninstall-macos.sh`,
  },
];

function installText(bundle) {
  return `فلتة ${version} — ${bundle.system}

برنامج على الجهاز، مش إضافة المتصفح. بيقلب النص المتعلم في أي برنامج.

${bundle.stepsAr}

---

Falta ${version} — ${bundle.systemEn}

A program on the computer, not the browser extension. It flips selected text in any app.

${bundle.stepsEn}
`;
}

export function writeBundles(outDir = "dist") {
  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const bundle of bundles) {
    const stage = join(outDir, `stage-${bundle.name}`);
    rmSync(stage, { recursive: true, force: true });
    mkdirSync(join(stage, "scripts", "startup"), { recursive: true });
    cpSync("extension", join(stage, "extension"), { recursive: true });
    cpSync("web", join(stage, "web"), { recursive: true });
    cpSync("cli", join(stage, "cli"), { recursive: true });
    mkdirSync(join(stage, "src"), { recursive: true });
    cpSync("src/falta-core.js", join(stage, "src", "falta-core.js"));
    for (const script of bundle.scripts) {
      cpSync(join("scripts", "startup", script), join(stage, "scripts", "startup", script));
    }
    writeFileSync(join(stage, "INSTALL.txt"), installText(bundle), "utf8");
    const zip = zipDirectory(stage);
    const path = join(outDir, `${bundle.name}.zip`);
    writeFileSync(path, zip.body);
    rmSync(stage, { recursive: true, force: true });
    written.push(path);
    console.log(`${path}: ${zip.count} files, ${zip.body.length} bytes`);
  }
  return written;
}

function ranAsScript() {
  const entry = process.argv[1];
  if (!entry) return false;
  return pathToFileURL(join(process.cwd(), entry)).href === import.meta.url
    || pathToFileURL(entry).href === import.meta.url;
}

if (ranAsScript()) writeBundles();
