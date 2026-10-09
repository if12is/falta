# Falta system-wide hotkey. Ctrl+Shift+Y copies the selection, flips it
# with the Arabic 101 converter, pastes it back, and restores the clipboard.
# If nothing is selected, the clipboard is put back and nothing is pasted.
$ErrorActionPreference = "Stop"

$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$flip = Join-Path $PSScriptRoot "flip.mjs"
$nodeFile = Join-Path $PSScriptRoot "falta-node.path"
$logDir = Join-Path $env:LOCALAPPDATA "Falta"
$logFile = Join-Path $logDir "hotkey.log"

function Write-HotkeyLog {
  param([string]$Message)
  try {
    if (-not (Test-Path -LiteralPath $logDir)) {
      New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    $line = (Get-Date -Format "yyyy-MM-dd HH:mm:ss") + " " + $Message
    Add-Content -LiteralPath $logFile -Value $line -Encoding utf8
  } catch {}
}

function Find-Node {
  if (Test-Path -LiteralPath $nodeFile) {
    $saved = (Get-Content -LiteralPath $nodeFile -Raw -ErrorAction SilentlyContinue)
    if ($saved) { $saved = $saved.Trim() }
    if ($saved -and (Test-Path -LiteralPath $saved)) { return $saved }
  }
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source -and (Test-Path -LiteralPath $cmd.Source)) { return $cmd.Source }
  foreach ($path in @(
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
  )) {
    if (Test-Path -LiteralPath $path) { return $path }
  }
  return $null
}

$mutex = New-Object System.Threading.Mutex($false, "Local\FaltaHotkeyCtrlShiftY")
if (-not $mutex.WaitOne(0, $false)) { exit 0 }

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$csharp = @'
using System;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace FaltaHotkey {
  public class Keys {
    const uint KEYUP = 2;
    const byte VK_CONTROL = 0x11;
    const byte VK_SHIFT = 0x10;
    const byte VK_MENU = 0x12;
    const byte VK_LWIN = 0x5B;
    const byte VK_LSHIFT = 0xA0;
    const byte VK_RSHIFT = 0xA1;
    const byte VK_LCONTROL = 0xA2;
    const byte VK_RCONTROL = 0xA3;
    const byte VK_LMENU = 0xA4;
    const byte VK_RMENU = 0xA5;

    [DllImport("user32.dll")]
    static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);

    static void Up(byte key) {
      keybd_event(key, 0, KEYUP, UIntPtr.Zero);
    }

    public static void ReleaseModifiers() {
      Up(VK_SHIFT);
      Up(VK_LSHIFT);
      Up(VK_RSHIFT);
      Up(VK_CONTROL);
      Up(VK_LCONTROL);
      Up(VK_RCONTROL);
      Up(VK_MENU);
      Up(VK_LMENU);
      Up(VK_RMENU);
      Up(VK_LWIN);
    }

    public static void TapCtrl(byte key) {
      ReleaseModifiers();
      Thread.Sleep(40);
      keybd_event(VK_CONTROL, 0, 0, UIntPtr.Zero);
      Thread.Sleep(15);
      keybd_event(key, 0, 0, UIntPtr.Zero);
      Thread.Sleep(15);
      keybd_event(key, 0, KEYUP, UIntPtr.Zero);
      keybd_event(VK_CONTROL, 0, KEYUP, UIntPtr.Zero);
    }
  }

  public class Window : NativeWindow {
    public event EventHandler Pressed;
    const int WM_HOTKEY = 0x0312;
    const int MOD_CONTROL = 0x0002;
    const int MOD_SHIFT = 0x0004;
    const int MOD_NOREPEAT = 0x4000;
    const int VK_Y = 0x59;
    const int HOTKEY_ID = 1;

    [DllImport("user32.dll", SetLastError = true)]
    static extern bool RegisterHotKey(IntPtr hWnd, int id, uint fsModifiers, uint vk);

    [DllImport("user32.dll", SetLastError = true)]
    static extern bool UnregisterHotKey(IntPtr hWnd, int id);

    public bool Start() {
      CreateHandle(new CreateParams());
      return RegisterHotKey(Handle, HOTKEY_ID, (uint)(MOD_CONTROL | MOD_SHIFT | MOD_NOREPEAT), VK_Y);
    }

    public void Stop() {
      UnregisterHotKey(Handle, HOTKEY_ID);
      DestroyHandle();
    }

    protected override void WndProc(ref Message m) {
      if (m.Msg == WM_HOTKEY && Pressed != null) {
        Pressed(this, EventArgs.Empty);
      }
      base.WndProc(ref m);
    }
  }
}
'@

Add-Type -TypeDefinition $csharp -ReferencedAssemblies @("System.Windows.Forms") -Language CSharp

$script:node = Find-Node
if (-not $script:node) {
  Write-HotkeyLog "node missing"
  exit 1
}

$script:busy = $false

function Set-ClipText {
  param([string]$Text)
  for ($i = 0; $i -lt 12; $i++) {
    try {
      [System.Windows.Forms.Clipboard]::SetText($Text)
      return $true
    } catch {
      Start-Sleep -Milliseconds 40
    }
  }
  return $false
}

function Get-ClipText {
  for ($i = 0; $i -lt 8; $i++) {
    try {
      if ([System.Windows.Forms.Clipboard]::ContainsText()) {
        return [System.Windows.Forms.Clipboard]::GetText()
      }
      return $null
    } catch {
      Start-Sleep -Milliseconds 40
    }
  }
  return $null
}

function Get-ClipSnap {
  $snap = @{ Text = $null; HadText = $false; Image = $null }
  try {
    if ([System.Windows.Forms.Clipboard]::ContainsText()) {
      $snap.Text = [System.Windows.Forms.Clipboard]::GetText()
      $snap.HadText = $true
    }
  } catch {}
  try {
    if ([System.Windows.Forms.Clipboard]::ContainsImage()) {
      $snap.Image = [System.Windows.Forms.Clipboard]::GetImage()
    }
  } catch {}
  return $snap
}

function Restore-ClipSnap {
  param($Snap)
  for ($i = 0; $i -lt 8; $i++) {
    try {
      if ($Snap.Image -and -not $Snap.HadText) {
        [System.Windows.Forms.Clipboard]::SetImage($Snap.Image)
      } elseif ($Snap.HadText) {
        [System.Windows.Forms.Clipboard]::SetText([string]$Snap.Text)
      } else {
        [System.Windows.Forms.Clipboard]::Clear()
      }
      return
    } catch {
      Start-Sleep -Milliseconds 40
    }
  }
}

function Convert-FaltaText {
  param([string]$Text)
  $dir = Join-Path $env:TEMP ("falta-" + [guid]::NewGuid().ToString("n"))
  New-Item -ItemType Directory -Path $dir -Force | Out-Null
  $inFile = Join-Path $dir "in.txt"
  $outFile = Join-Path $dir "out.txt"
  $utf8 = New-Object System.Text.UTF8Encoding $false
  try {
    [System.IO.File]::WriteAllText($inFile, $Text, $utf8)
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $script:node
    $psi.Arguments = '"' + $flip + '" "' + $inFile + '" "' + $outFile + '"'
    $psi.WorkingDirectory = $root
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardError = $true
    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    if (-not $proc.Start()) { return $null }
    if (-not $proc.WaitForExit(15000)) {
      try { $proc.Kill() } catch {}
      return $null
    }
    if ($proc.ExitCode -ne 0) { return $null }
    if (-not (Test-Path -LiteralPath $outFile)) { return $null }
    return [System.IO.File]::ReadAllText($outFile, $utf8)
  } finally {
    Remove-Item -LiteralPath $dir -Recurse -Force -ErrorAction SilentlyContinue
  }
}

function Invoke-FaltaFlip {
  Start-Sleep -Milliseconds 120
  $snap = Get-ClipSnap
  $sentinel = ([char]1) + "FALTA-" + [guid]::NewGuid().ToString("n")
  if (-not (Set-ClipText $sentinel)) {
    Restore-ClipSnap $snap
    return
  }
  Start-Sleep -Milliseconds 60
  [FaltaHotkey.Keys]::TapCtrl(0x43)
  $copied = $null
  for ($i = 0; $i -lt 22; $i++) {
    Start-Sleep -Milliseconds 40
    $current = Get-ClipText
    if ($null -ne $current -and $current -ne $sentinel -and $current -ne "") {
      $copied = $current
      break
    }
  }
  if ($null -eq $copied) {
    Restore-ClipSnap $snap
    return
  }
  $flipped = Convert-FaltaText $copied
  if ($null -eq $flipped) {
    Write-HotkeyLog "convert failed"
    Restore-ClipSnap $snap
    return
  }
  if (-not (Set-ClipText $flipped)) {
    Restore-ClipSnap $snap
    return
  }
  Start-Sleep -Milliseconds 40
  [FaltaHotkey.Keys]::TapCtrl(0x56)
  Start-Sleep -Milliseconds 280
  Restore-ClipSnap $snap
}

$window = New-Object FaltaHotkey.Window
if (-not $window.Start()) {
  Write-HotkeyLog "RegisterHotKey failed"
  try {
    [System.Windows.Forms.MessageBox]::Show(
      "فلتة ما قدرتش تسجّل الاختصار Ctrl+Shift+Y. ممكن برنامج تاني ماسكه.`r`n`r`nFalta could not register Ctrl+Shift+Y. Another program may be using it.",
      "Falta",
      [System.Windows.Forms.MessageBoxButtons]::OK,
      [System.Windows.Forms.MessageBoxIcon]::Error
    ) | Out-Null
  } catch {}
  exit 1
}

$window.add_Pressed({
  if ($script:busy) { return }
  $script:busy = $true
  try {
    Invoke-FaltaFlip
  } catch {
    Write-HotkeyLog $_.Exception.Message
  } finally {
    $script:busy = $false
  }
})

Write-HotkeyLog "listening"
[System.Windows.Forms.Application]::Run()
