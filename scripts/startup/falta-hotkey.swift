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

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
_ = accessibilityTrusted(prompt: true)
if !installHotkey() {
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
app.run()
