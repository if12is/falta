import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { zipDirectory } from "./pack.mjs";

const version = process.env.FALTA_VERSION || "1.0.0";

const bundles = [
  {
    name: "falta-windows",
    scripts: ["install-windows.ps1", "uninstall-windows.ps1"],
    install: "powershell -ExecutionPolicy Bypass -File scripts\\startup\\install-windows.ps1",
    uninstall: "powershell -ExecutionPolicy Bypass -File scripts\\startup\\uninstall-windows.ps1",
    system: "ويندوز",
    systemEn: "Windows",
  },
  {
    name: "falta-ubuntu",
    scripts: ["install-linux.sh", "uninstall-linux.sh"],
    install: "sh scripts/startup/install-linux.sh",
    uninstall: "sh scripts/startup/uninstall-linux.sh",
    system: "أوبونتو ولينكس",
    systemEn: "Ubuntu and Linux",
  },
  {
    name: "falta-macos",
    scripts: ["install-macos.sh", "uninstall-macos.sh"],
    install: "sh scripts/startup/install-macos.sh",
    uninstall: "sh scripts/startup/uninstall-macos.sh",
    system: "ماك",
    systemEn: "Mac",
  },
];

function installText(bundle) {
  return `فلتة ${version} — ${bundle.system}

1. فك الضغط في مجلد ثابت. ما تحذفوش، لأن التشغيل مع الجهاز بيفتح الصفحة من المكان ده.
2. الإضافة، على كروم وإيدج وبريف وأوبرا وفيفالدي: افتح صفحة الإضافات، فعّل وضع المطوّر، واختار مجلد extension اللي جوه هنا.
3. فايرفوكس: about:debugging ثم Load Temporary Add-on واختار extension/manifest.json. الإضافة المؤقتة بتتشال لما المتصفح يقفل. التثبيت الدايم من ملف falta-firefox.zip على صفحة ريليز جيت هب، بعد توقيع موزيلا.
4. سفاري: افتح web/index.html.
5. عشان تفتح مع تسجيل الدخول، من جذر المجلد ده:
   ${bundle.install}
   للإزالة:
   ${bundle.uninstall}

---

Falta ${version} — ${bundle.systemEn}

1. Unzip into a folder you will keep. Login startup opens the page from that place.
2. Chrome, Edge, Brave, Opera, and Vivaldi: open the extensions page, turn on developer mode, and choose the extension folder inside this unzipped folder.
3. Firefox: about:debugging, then Load Temporary Add-on, and choose extension/manifest.json. A temporary add-on disappears when Firefox closes. A signed copy comes from falta-firefox.zip on the GitHub release, after Mozilla signs it.
4. Safari: open web/index.html.
5. To open at login, from this folder:
   ${bundle.install}
   To remove:
   ${bundle.uninstall}
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
