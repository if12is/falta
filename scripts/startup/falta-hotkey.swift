import Cocoa
import Carbon
import Foundation

// System-wide Command+Shift+Y. Copies the selection, flips it with the
// Arabic 101 converter, pastes it back, and restores the clipboard.
// If nothing is selected, the clipboard is put back and nothing is pasted.

private let keyY: UInt32 = 16
private let modCommandShift: UInt32 = 256 | 512
private let keyCommand: CGKeyCode = 55
private let keyC: CGKeyCode = 8
private let keyV: CGKeyCode = 9

private var hotKeyRef: EventHotKeyRef?
private var busy = false
private var warned = false

private func repoRoot() -> URL {
    if let env = ProcessInfo.processInfo.environment["FALTA_ROOT"], !env.isEmpty {
        return URL(fileURLWithPath: env, isDirectory: true)
    }
    let exe = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent()
    return exe.deletingLastPathComponent().deletingLastPathComponent()
}

private func nodePath(root: URL) -> String? {
    if let env = ProcessInfo.processInfo.environment["FALTA_NODE"],
       FileManager.default.isExecutableFile(atPath: env) {
        return env
    }
    let pathFile = root.appendingPathComponent("scripts/startup/falta-node.path")
    if let text = try? String(contentsOf: pathFile, encoding: .utf8) {
        let line = text.trimmingCharacters(in: .whitespacesAndNewlines)
        if FileManager.default.isExecutableFile(atPath: line) {
            return line
        }
    }
    return nil
}

private func log(_ message: String) {
    let dir = FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Library/Logs", isDirectory: true)
    try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
    let file = dir.appendingPathComponent("Falta.log")
    let line = ISO8601DateFormatter().string(from: Date()) + " " + message + "\n"
    let existing = (try? String(contentsOf: file, encoding: .utf8)) ?? ""
    try? (existing + line).write(to: file, atomically: true, encoding: .utf8)
}

private func accessibilityTrusted(prompt: Bool) -> Bool {
    if !prompt {
        return AXIsProcessTrusted()
    }
    let options = ["AXTrustedCheckOptionPrompt": true] as CFDictionary
    return AXIsProcessTrustedWithOptions(options)
}

private func showNeedAccess() {
    if warned { return }
    warned = true
    let alert = NSAlert()
    alert.messageText = "فلتة"
    alert.informativeText = """
    اسمح لـ FaltaHotkey مرة واحدة من:
    System Settings → Privacy & Security → Accessibility

    ---

    Allow FaltaHotkey once in:
    System Settings → Privacy & Security → Accessibility
    """
    alert.alertStyle = .warning
    NSApp.activate(ignoringOtherApps: true)
    alert.runModal()
}

private func postKey(_ code: CGKeyCode, down: Bool, flags: CGEventFlags) {
    let source = CGEventSource(stateID: .hidSystemState)
    guard let event = CGEvent(keyboardEventSource: source, virtualKey: code, keyDown: down) else { return }
    event.flags = flags
    event.post(tap: .cghidEventTap)
}

private func releaseModifiers() {
    let keys: [CGKeyCode] = [56, 60, 59, 62, 58, 61, 55, 54, 63]
    for key in keys {
        postKey(key, down: false, flags: [])
    }
}

private func tapCommand(_ key: CGKeyCode) {
    releaseModifiers()
    Thread.sleep(forTimeInterval: 0.05)
    postKey(keyCommand, down: true, flags: .maskCommand)
    Thread.sleep(forTimeInterval: 0.02)
    postKey(key, down: true, flags: .maskCommand)
    Thread.sleep(forTimeInterval: 0.02)
    postKey(key, down: false, flags: .maskCommand)
    postKey(keyCommand, down: false, flags: [])
}

private func capturePasteboard() -> [[NSPasteboard.PasteboardType: Data]] {
    let pasteboard = NSPasteboard.general
    guard let items = pasteboard.pasteboardItems else { return [] }
    return items.map { item in
        var dict: [NSPasteboard.PasteboardType: Data] = [:]
        for type in item.types {
            if let data = item.data(forType: type) {
                dict[type] = data
            }
        }
        return dict
    }
}

private func restorePasteboard(_ items: [[NSPasteboard.PasteboardType: Data]]) {
    let pasteboard = NSPasteboard.general
    pasteboard.clearContents()
    if items.isEmpty { return }
    let writers: [NSPasteboardItem] = items.map { dict in
        let item = NSPasteboardItem()
        for (type, data) in dict {
            item.setData(data, forType: type)
        }
        return item
    }
    pasteboard.writeObjects(writers)
}

private func waitForCopy(sentinel: String) -> String? {
    let deadline = Date().addingTimeInterval(0.9)
    while Date() < deadline {
        if let text = NSPasteboard.general.string(forType: .string),
           text != sentinel,
           !text.isEmpty {
            return text
        }
        Thread.sleep(forTimeInterval: 0.04)
    }
    return nil
}

private func convertText(_ text: String, node: String, root: URL) -> String? {
    let flip = root.appendingPathComponent("scripts/startup/flip.mjs")
    let dir = FileManager.default.temporaryDirectory.appendingPathComponent("falta-" + UUID().uuidString, isDirectory: true)
    do {
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        let input = dir.appendingPathComponent("in.txt")
        let output = dir.appendingPathComponent("out.txt")
        try text.write(to: input, atomically: true, encoding: .utf8)
        let task = Process()
        task.executableURL = URL(fileURLWithPath: node)
        task.arguments = [flip.path, input.path, output.path]
        task.currentDirectoryURL = root
        try task.run()
        task.waitUntilExit()
        guard task.terminationStatus == 0 else {
            try? FileManager.default.removeItem(at: dir)
            return nil
        }
        let flipped = try String(contentsOf: output, encoding: .utf8)
        try? FileManager.default.removeItem(at: dir)
        return flipped
    } catch {
        try? FileManager.default.removeItem(at: dir)
        log("convert failed: \(error)")
        return nil
    }
}

private func performFlip() {
    if busy { return }
    busy = true
    defer { busy = false }

    Thread.sleep(forTimeInterval: 0.12)

    if !accessibilityTrusted(prompt: false) {
        showNeedAccess()
        return
    }

    let root = repoRoot()
    guard let node = nodePath(root: root) else {
        log("node missing")
        return
    }

    let saved = capturePasteboard()
    let sentinel = "\u{0001}FALTA-" + UUID().uuidString
    let pasteboard = NSPasteboard.general
    pasteboard.clearContents()
    pasteboard.setString(sentinel, forType: .string)
    Thread.sleep(forTimeInterval: 0.08)
    tapCommand(keyC)

    guard let copied = waitForCopy(sentinel: sentinel) else {
        restorePasteboard(saved)
        return
    }
    guard let flipped = convertText(copied, node: node, root: root) else {
        restorePasteboard(saved)
        return
    }
    pasteboard.clearContents()
    pasteboard.setString(flipped, forType: .string)
    Thread.sleep(forTimeInterval: 0.05)
    tapCommand(keyV)
    Thread.sleep(forTimeInterval: 0.28)
    restorePasteboard(saved)
}

private func carbonCallback(next: EventHandlerCallRef?, event: EventRef?, user: UnsafeMutableRawPointer?) -> OSStatus {
    DispatchQueue.main.async {
        performFlip()
    }
    return noErr
}

private func installHotkey() -> Bool {
    var spec = EventTypeSpec(
        eventClass: OSType(kEventClassKeyboard),
        eventKind: UInt32(kEventHotKeyPressed)
    )
    let installed = InstallEventHandler(
        GetApplicationEventTarget(),
        carbonCallback,
        1,
        &spec,
        nil,
        nil
    )
    if installed != noErr {
        log("InstallEventHandler \(installed)")
        return false
    }
    let hotKeyID = EventHotKeyID(signature: OSType(0x464C5441), id: 1)
    let status = RegisterEventHotKey(
        keyY,
        modCommandShift,
        hotKeyID,
        GetApplicationEventTarget(),
        0,
        &hotKeyRef
    )
    if status != noErr {
        log("RegisterEventHotKey \(status)")
        return false
    }
    return hotKeyRef != nil
}

private var statusItem: NSStatusItem?
private var settingsPanel: SettingsPanel?

private func settingsFileURL() -> URL {
    FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Library/Application Support/Falta/settings.json")
}

private func readLayout() -> String {
    guard let text = try? String(contentsOf: settingsFileURL(), encoding: .utf8) else { return "windows" }
    let cleaned = text.replacingOccurrences(of: "\u{feff}", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
    guard let data = cleaned.data(using: .utf8),
          let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
          let layout = obj["layout"] as? String else { return "windows" }
    return layout == "mac" ? "mac" : "windows"
}

private func writeLayout(_ layout: String) {
    let value = layout == "mac" ? "mac" : "windows"
    let url = settingsFileURL()
    try? FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    let body = "{\"layout\":\"\(value)\"}\n"
    try? body.data(using: .utf8)?.write(to: url, options: .atomic)
}

private func plistURL() -> URL {
    FileManager.default.homeDirectoryForCurrentUser
        .appendingPathComponent("Library/LaunchAgents/io.github.if12is.falta.plist")
}

private func xmlEscape(_ value: String) -> String {
    value
        .replacingOccurrences(of: "&", with: "&amp;")
        .replacingOccurrences(of: "<", with: "&lt;")
        .replacingOccurrences(of: ">", with: "&gt;")
}

private func executablePath() -> String {
    let raw = CommandLine.arguments[0]
    if raw.hasPrefix("/") { return raw }
    let base = URL(fileURLWithPath: FileManager.default.currentDirectoryPath, isDirectory: true)
    return URL(fileURLWithPath: raw, relativeTo: base).path
}

private func launchctlOutput(_ args: [String]) -> String {
    let task = Process()
    task.executableURL = URL(fileURLWithPath: "/bin/launchctl")
    task.arguments = args
    let pipe = Pipe()
    task.standardOutput = pipe
    task.standardError = Pipe()
    do {
        try task.run()
        task.waitUntilExit()
    } catch {
        return ""
    }
    let data = pipe.fileHandleForReading.readDataToEndOfFile()
    return String(data: data, encoding: .utf8) ?? ""
}

private func serviceDisabled() -> Bool {
    let text = launchctlOutput(["print-disabled", "gui/\(getuid())"])
    for line in text.components(separatedBy: "\n") {
        if line.contains("io.github.if12is.falta") && line.contains("=> disabled") {
            return true
        }
    }
    return false
}

private func runAtLoad() -> Bool {
    guard let data = try? Data(contentsOf: plistURL()) else { return false }
    var format = PropertyListSerialization.PropertyListFormat.xml
    guard let plist = try? PropertyListSerialization.propertyList(from: data, options: [], format: &format) as? [String: Any] else {
        return false
    }
    return (plist["RunAtLoad"] as? Bool) == true
}

private func loginEnabled() -> Bool {
    runAtLoad() && !serviceDisabled()
}

private func writeFreshPlist(runAtLoad on: Bool) throws {
    let root = repoRoot()
    let node = nodePath(root: root) ?? ""
    let flag = on ? "true" : "false"
    let body = """
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
    <dict>
      <key>Label</key>
      <string>io.github.if12is.falta</string>
      <key>ProgramArguments</key>
      <array>
        <string>\(xmlEscape(executablePath()))</string>
      </array>
      <key>WorkingDirectory</key>
      <string>\(xmlEscape(root.path))</string>
      <key>EnvironmentVariables</key>
      <dict>
        <key>FALTA_NODE</key>
        <string>\(xmlEscape(node))</string>
        <key>FALTA_ROOT</key>
        <string>\(xmlEscape(root.path))</string>
      </dict>
      <key>RunAtLoad</key>
      <\(flag)/>
      <key>LimitLoadToSessionType</key>
      <string>Aqua</string>
      <key>ProcessType</key>
      <string>Interactive</string>
    </dict>
    </plist>
    """
    let url = plistURL()
    try FileManager.default.createDirectory(at: url.deletingLastPathComponent(), withIntermediateDirectories: true)
    try body.write(to: url, atomically: true, encoding: .utf8)
}

private func setRunAtLoad(_ on: Bool) throws {
    let url = plistURL()
    if FileManager.default.fileExists(atPath: url.path),
       let data = try? Data(contentsOf: url) {
        var format = PropertyListSerialization.PropertyListFormat.xml
        if var plist = try PropertyListSerialization.propertyList(from: data, options: [], format: &format) as? [String: Any] {
            plist["RunAtLoad"] = on
            let out = try PropertyListSerialization.data(fromPropertyList: plist, format: .xml, options: [])
            try out.write(to: url, options: .atomic)
            return
        }
    }
    try writeFreshPlist(runAtLoad: on)
}

@discardableResult
private func setLoginEnabled(_ on: Bool) -> Bool {
    do {
        try setRunAtLoad(on)
    } catch {
        log("login plist \(error)")
        return false
    }
    let task = Process()
    task.executableURL = URL(fileURLWithPath: "/bin/launchctl")
    task.arguments = [on ? "enable" : "disable", "gui/\(getuid())/io.github.if12is.falta"]
    do {
        try task.run()
        task.waitUntilExit()
    } catch {
        log("launchctl \(error)")
    }
    return true
}

private func faltaImage() -> NSImage? {
    let url = repoRoot().appendingPathComponent("extension/icons/icon128.png")
    guard let image = NSImage(contentsOf: url) else { return nil }
    image.size = NSSize(width: 18, height: 18)
    image.isTemplate = false
    return image
}

final class SettingsPanel: NSObject {
    let window: NSWindow
    let windowsButton: NSButton
    let macButton: NSButton
    let loginButton: NSButton
    private var refreshing = false

    override init() {
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 480, height: 520),
            styleMask: [.titled, .closable],
            backing: .buffered,
            defer: false
        )
        windowsButton = NSButton(radioButtonWithTitle: "عربي ١٠١", target: nil, action: nil)
        macButton = NSButton(radioButtonWithTitle: "عربي الماك", target: nil, action: nil)
        loginButton = NSButton(checkboxWithTitle: "تشغيل مع تسجيل الدخول", target: nil, action: nil)
        windowsButton.tag = 0
        macButton.tag = 1
        super.init()

        window.title = "فلتة — الإعدادات"
        window.backgroundColor = NSColor(srgbRed: 247.0 / 255.0, green: 243.0 / 255.0, blue: 236.0 / 255.0, alpha: 1)
        window.isReleasedWhenClosed = false
        windowsButton.target = self
        windowsButton.action = #selector(chooseLayout(_:))
        macButton.target = self
        macButton.action = #selector(chooseLayout(_:))
        loginButton.target = self
        loginButton.action = #selector(toggleLogin(_:))

        let content = window.contentView!
        let stack = NSStackView()
        stack.orientation = .vertical
        stack.alignment = .trailing
        stack.spacing = 8
        stack.translatesAutoresizingMaskIntoConstraints = false
        content.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: content.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: content.trailingAnchor, constant: -20),
            stack.topAnchor.constraint(equalTo: content.topAnchor, constant: 16),
            stack.bottomAnchor.constraint(lessThanOrEqualTo: content.bottomAnchor, constant: -16),
        ])

        func makeLabel(_ text: String) -> NSTextField {
            let field = NSTextField(wrappingLabelWithString: text)
            field.preferredMaxLayoutWidth = 440
            field.alignment = .right
            field.textColor = NSColor(srgbRed: 36.0 / 255.0, green: 28.0 / 255.0, blue: 22.0 / 255.0, alpha: 1)
            return field
        }

        stack.addArrangedSubview(makeLabel("فلتة شغالة"))
        stack.addArrangedSubview(makeLabel("الاختصار: Command+Shift+Y"))
        stack.addArrangedSubview(makeLabel("الاختصار ثابت ومش بيتغيّر من هنا."))
        stack.addArrangedSubview(makeLabel("لوحة الكيبورد"))
        stack.addArrangedSubview(windowsButton)
        stack.addArrangedSubview(macButton)
        stack.addArrangedSubview(makeLabel("عربي ١٠١ لويندوز ولينكس ولوحة Arabic - PC. عربي الماك للوحة Arabic الأصلية. الصف السفلي هو اللي بيتغير. التغيير يشتغل من القلب الجاي."))
        stack.addArrangedSubview(loginButton)
        stack.addArrangedSubview(makeLabel("إلغاء العلامة ما يقفلش البرنامج دلوقتي. خروج من أيقونة القائمة يوقفه."))
        if !AXIsProcessTrusted() {
            stack.addArrangedSubview(makeLabel("محتاج إذن Accessibility من Privacy & Security، زي ما المثبّت طلب."))
        }
        stack.addArrangedSubview(makeLabel("التغيير بيتحفظ على طول."))
        window.center()
        reload()
    }

    func show() {
        reload()
        NSApp.activate(ignoringOtherApps: true)
        window.level = .floating
        window.makeKeyAndOrderFront(nil)
    }

    func reload() {
        refreshing = true
        let layout = readLayout()
        windowsButton.state = layout == "mac" ? .off : .on
        macButton.state = layout == "mac" ? .on : .off
        loginButton.state = loginEnabled() ? .on : .off
        refreshing = false
    }

    @objc func chooseLayout(_ sender: NSButton) {
        if refreshing || sender.state != .on { return }
        writeLayout(sender.tag == 1 ? "mac" : "windows")
    }

    @objc func toggleLogin(_ sender: NSButton) {
        if refreshing { return }
        let wanted = sender.state == .on
        if !setLoginEnabled(wanted) {
            refreshing = true
            sender.state = loginEnabled() ? .on : .off
            refreshing = false
        }
    }
}

final class MenuBridge: NSObject {
    static let shared = MenuBridge()

    @objc func openSettings(_ sender: Any?) {
        if settingsPanel == nil {
            settingsPanel = SettingsPanel()
        }
        settingsPanel?.show()
    }

    @objc func quit(_ sender: Any?) {
        if let ref = hotKeyRef {
            UnregisterEventHotKey(ref)
            hotKeyRef = nil
        }
        let task = Process()
        task.executableURL = URL(fileURLWithPath: "/bin/launchctl")
        task.arguments = ["bootout", "gui/\(getuid())/io.github.if12is.falta"]
        try? task.run()
        NSApp.terminate(nil)
    }
}

private func installStatusItem(hotkeyOK: Bool) {
    let item = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
    statusItem = item
    if let button = item.button {
        if let image = faltaImage() {
            button.image = image
        } else {
            button.title = "ف"
        }
        button.imagePosition = .imageOnly
        button.toolTip = "فلتة — Command+Shift+Y"
    }
    let menu = NSMenu()
    let status = NSMenuItem(
        title: hotkeyOK ? "فلتة شغالة" : "الاختصار ما تسجلش",
        action: nil,
        keyEquivalent: ""
    )
    status.isEnabled = false
    menu.addItem(status)
    let shortcut = NSMenuItem(title: "الاختصار: Command+Shift+Y", action: nil, keyEquivalent: "")
    shortcut.isEnabled = false
    menu.addItem(shortcut)
    if !AXIsProcessTrusted() {
        let access = NSMenuItem(title: "محتاج إذن Accessibility", action: nil, keyEquivalent: "")
        access.isEnabled = false
        menu.addItem(access)
    }
    menu.addItem(.separator())
    let settings = NSMenuItem(title: "الإعدادات", action: #selector(MenuBridge.openSettings(_:)), keyEquivalent: "")
    settings.target = MenuBridge.shared
    menu.addItem(settings)
    let quit = NSMenuItem(title: "خروج", action: #selector(MenuBridge.quit(_:)), keyEquivalent: "")
    quit.target = MenuBridge.shared
    menu.addItem(quit)
    item.menu = menu
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
_ = accessibilityTrusted(prompt: true)
let hotkeyOK = installHotkey()
if !hotkeyOK {
    let alert = NSAlert()
    alert.messageText = "فلتة"
    alert.informativeText = """
    ما قدرناش نسجّل الاختصار Command+Shift+Y. ممكن برنامج تاني ماسكه.

    ---

    Could not register Command+Shift+Y. Another program may be using it.
    """
    NSApp.activate(ignoringOtherApps: true)
    alert.runModal()
}
installStatusItem(hotkeyOK: hotkeyOK)
app.run()
