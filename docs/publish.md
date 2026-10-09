# نشر فلتة

فلتة لسه مش متسجلة على أي متجر. الجهاز ده ما يقدرش يبعت الإضافة بدلًا عنك: محتاج حسابك أنت على كل متجر. الملفات دي بتجهّز الحزمة بس.

من جذر الريبو، على Node 18 أو أحدث:

```bash
npm run pack
```

الأمر يكتب:

- `dist/falta-chromium.zip` لكروم وإيدج وأوبرا، ولكل متصفح كروميوم.
- `dist/falta-firefox.zip` لفايرفوكس.

الاتنين نفس مجلد `extension`، والـ `manifest.json` في جذر الملف المضغوط. مفيش `node_modules` ومفيش أسرار. `dist/` متتجاهل في جيت، والأمر يعيد إنشاءه.

الخصوصية اللي تكتبها في النماذج: مفيش كود بعيد، الإضافة مالهاش صلاحية مضيف ولا شبكة، والنص ما بيتجمعش وما بيتباعش. الصلاحيات الموجودة: `contextMenus` و`storage` و`activeTab` و`scripting` و`clipboardWrite`. سكربت المحتوى بيقرأ التحديد لما المستخدم يطلب القلب.

## Chrome Web Store

1. افتح [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) بحساب جوجل.
2. ادفع رسوم المطوّر مرة واحدة (خمسة دولارات). من غير الحساب ده مفيش رفع.
3. New item، وارفع `dist/falta-chromium.zip`.
4. في Privacy: Single purpose، ومفيش remote code، و Data usage: لا جمع ولا بيع للبيانات.
5. برّر كل صلاحية بجملة قصيرة: قائمة الزر الأيمن، تخزين الإعدادات والعداد محليًا، الصفحة الحالية، حقن القلب لما المستخدم يطلب، ونسخ النتيجة.
6. ارفع لقطات من عندك. متستخدمش لقطات متألفة.
7. Submit for review. الظهور في المتجر بعد الموافقة، مش من الريبو.

## Microsoft Edge Add-ons

1. افتح [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview) بحساب مايكروسوفت.
2. تقدر ترفع `dist/falta-chromium.zip`، أو تستورد من كروم بعد ما الإضافة تتنشر هناك.
3. نفس كلام الخصوصية: مفيش كود بعيد، ومفيش بيانات بتتباع.
4. Edge مش بيطلب رسوم تسجيل زي كروم. النشر برضو محتاج موافقة المتجر، ومش حاصل من هنا.

## Firefox (AMO)

1. افتح [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/).
2. ارفع `dist/falta-firefox.zip`. موزيلا بتوقّع الملف وترجّعه `.xpi`. التوقيع من عندهم، مش من الريبو.
3. المعرّف في المانيفست: `falta@if12is.github.io`.
4. التثبيت المؤقت من `about:debugging` حاجة تانية: بيشتغل على جهازك وبيتشال لما فايرفوكس يقفل. الإدراج في AMO هو اللي يخليها تتثبت عند الناس وتفضل.
5. في الاستمارة: مفيش بيانات بتتبعت.

## Opera Addons

1. افتح [Opera Addons developer](https://addons.opera.com/developer/).
2. ارفع `dist/falta-chromium.zip`.
3. نفس حدود الخصوصية. أوبرا مش بتطلب رسوم تسجيل زي كروم.

## Safari

سفاري مش بيحمّل مجلد `extension` من صفحة الإضافات.

1. لازم حساب [Apple Developer](https://developer.apple.com/programs/) (البرنامج المدفوع)، و Xcode على ماك.
2. من جذر الريبو على الماك:

```bash
xcrun safari-web-extension-converter extension --app-name Falta --bundle-identifier io.github.if12is.falta --macos-only
```

3. Xcode يفتح مشروع. من هناك بتعمل Archive وتبعت لـ App Store Connect، أو توقّع نسخة للتوزيع.
4. من غير الحساب والأدوات دي، الطريق لسفاري هو `web/index.html` أو زر الإشارة.

---

# Publishing Falta

Falta is not listed in any store. This machine cannot submit it for you. Each dashboard needs your own account. The command below only builds the packages.

From the repo root, on Node 18 or newer:

```bash
npm run pack
```

That writes:

- `dist/falta-chromium.zip` for Chrome, Edge, Opera, and other Chromium browsers.
- `dist/falta-firefox.zip` for Firefox.

Both zips are the `extension` folder, with `manifest.json` at the root of the archive. No `node_modules` and no secrets. `dist/` is gitignored and the command recreates it.

Privacy text for the forms: no remote code, no host permission, no network permission, and the text is not collected or sold. The permissions are `contextMenus`, `storage`, `activeTab`, `scripting`, and `clipboardWrite`. The content script reads the selection when the user asks for a flip.

## Chrome Web Store

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) with a Google account.
2. Pay the one-time developer fee (five US dollars). There is no upload without that account.
3. Choose New item and upload `dist/falta-chromium.zip`.
4. Privacy: single purpose, no remote code, and data usage set to no collection and no sale.
5. Justify each permission in a short line: the context menu, local settings and the local counter, the current tab, injecting the flip when the user asks, and copying the result.
6. Upload screenshots you took yourself.
7. Submit for review. A listing exists only after the store approves it, not because the repo is public.

## Microsoft Edge Add-ons

1. Open [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview) with a Microsoft account.
2. Upload `dist/falta-chromium.zip`, or import the Chrome listing after that one is public.
3. Same privacy statement: no remote code, no data sold.
4. Edge does not charge Chrome’s registration fee. Publication still waits on the store. Nothing has been submitted from here.

## Firefox (AMO)

1. Open the [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/).
2. Upload `dist/falta-firefox.zip`. Mozilla signs it and returns an `.xpi`. The signature comes from them, not from this repo.
3. The manifest id is `falta@if12is.github.io`.
4. A temporary add-on from `about:debugging` is a different thing: it runs on your machine and disappears when Firefox closes. An AMO listing is what lets other people install it and keep it.
5. On the form: no data is transmitted.

## Opera Addons

1. Open the [Opera Addons developer dashboard](https://addons.opera.com/developer/).
2. Upload `dist/falta-chromium.zip`.
3. Same privacy limits. Opera does not charge Chrome’s registration fee.

## Safari

Safari cannot load the `extension` folder from its extensions page.

1. You need a paid [Apple Developer](https://developer.apple.com/programs/) account, and Xcode on a Mac.
2. From the repo root on that Mac:

```bash
xcrun safari-web-extension-converter extension --app-name Falta --bundle-identifier io.github.if12is.falta --macos-only
```

3. Xcode opens a project. Archive it and send it through App Store Connect, or sign a build yourself.
4. Without that account and those tools, Safari users get `web/index.html` or the bookmarklet.
