# Installs the Falta system-wide hotkey (Ctrl+Shift+Y) into the Startup folder.
# The program runs from this unzipped folder. Do not delete the folder.
# Remove it with uninstall-windows.ps1.
$ErrorActionPreference = "Stop"

$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$hotkey = Join-Path $PSScriptRoot "falta-hotkey.ps1"
$flip = Join-Path $PSScriptRoot "flip.mjs"
$core = Join-Path $root "src\falta-core.js"
$nodeFile = Join-Path $PSScriptRoot "falta-node.path"

function Show-FaltaBox {
  param([string]$Text, [string]$IconName)
  try {
    Add-Type -AssemblyName System.Windows.Forms
    $icon = [System.Windows.Forms.MessageBoxIcon]::Information
    if ($IconName -eq "Error") { $icon = [System.Windows.Forms.MessageBoxIcon]::Error }
    [System.Windows.Forms.MessageBox]::Show(
      $Text,
      "Falta",
      [System.Windows.Forms.MessageBoxButtons]::OK,
      $icon
    ) | Out-Null
  } catch {
    Write-Output $Text
  }
}

function Get-NodeMessage {
  $ar = @"
فلتة محتاجة برنامج Node عشان تقلب الحروف في أي برنامج.

نزّل Node 18 أو أحدث من:
https://nodejs.org

ثبّته (نسخة LTS)، وبعدين شغّل ملف التثبيت ده تاني:
scripts\startup\install-windows.cmd
"@
  $en = @"
Falta needs Node to flip letters in every program.

Install Node 18 or newer from:
https://nodejs.org

Then run this installer again:
scripts\startup\install-windows.cmd
"@
  return ($ar.Trim() + "`r`n`r`n---" + "`r`n`r`n" + $en.Trim())
}

function Find-Node {
  $candidates = @()
  $cmd = Get-Command node -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source) { $candidates += $cmd.Source }
  $candidates += @(
    "$env:ProgramFiles\nodejs\node.exe",
    "${env:ProgramFiles(x86)}\nodejs\node.exe",
    "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
  )
  foreach ($path in $candidates) {
    if ($path -and (Test-Path -LiteralPath $path)) {
      return (Resolve-Path -LiteralPath $path).Path
    }
  }
  return $null
}

function Test-Node18 {
  param([string]$Node)
  try {
    $raw = (& $Node -p "process.versions.node" | Out-String).Trim()
  } catch {
    return $false
  }
  if ($raw -match '^(\d+)\.') {
    return ([int]$Matches[1] -ge 18)
  }
  return $false
}

function Stop-FaltaHotkey {
  $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -and ($_.CommandLine -like "*falta-hotkey.ps1*")
  }
  foreach ($proc in $procs) {
    Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
  }
  Start-Sleep -Milliseconds 400
}

try {
  try { chcp 65001 > $null } catch {}
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8

  foreach ($file in @($hotkey, $flip, $core)) {
    if (-not (Test-Path -LiteralPath $file)) {
      throw "Missing $file"
    }
  }

  $node = Find-Node
  if (-not $node -or -not (Test-Node18 $node)) {
    $message = Get-NodeMessage
    Write-Output $message
    Show-FaltaBox $message "Error"
    exit 1
  }

  Set-Content -LiteralPath $nodeFile -Value $node -Encoding ascii
  Stop-FaltaHotkey
  . (Join-Path $PSScriptRoot "falta-win.ps1")
  $lnkPath = Install-FaltaLoginShortcut -Root $root -Hotkey $hotkey

  Start-Process -FilePath $powershell -ArgumentList "-NoProfile -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$hotkey`"" -WorkingDirectory $root -WindowStyle Hidden
  $alive = $null
  for ($i = 0; $i -lt 8; $i++) {
    Start-Sleep -Seconds 1
    $alive = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
      $_.CommandLine -and ($_.CommandLine -like "*falta-hotkey.ps1*")
    }
    if ($alive) { break }
  }
  if (-not $alive) {
    $logPath = Join-Path $env:LOCALAPPDATA "Falta\hotkey.log"
    $detail = ""
    if (Test-Path -LiteralPath $logPath) {
      $detail = Get-Content -LiteralPath $logPath -Tail 8 -ErrorAction SilentlyContinue | Out-String
    }
    throw ("البرنامج وقف قبل ما يشتغل.`r`n`r`nThe hotkey program stopped.`r`n" + $detail)
  }

  $okAr = @"
تمام. فلتة اتثبتت على الجهاز.

علّم أي نص في أي برنامج (وورد، نوت باد، المتصفح، الشات) واضغط Ctrl+Shift+Y.
هتشتغل كمان بعد ما الجهاز يعيد التشغيل.

ما تحذفش المجلد ده، لأن البرنامج بيشتغل منه.
أيقونة فلتة بتظهر جنب الساعة. لو اتخبّت، افتح سهم الأيقونات المخفية. منها الإعدادات وخروج.
"@
  $okEn = @"
Falta is installed.

Select text in any program (Word, Notepad, a browser, chat) and press Ctrl+Shift+Y.
It also starts when Windows starts.

Do not delete this folder. The program runs from it.
A Falta icon appears by the clock. If it is hidden, open the hidden-icons arrow. Settings and Quit are there.
"@
  $ok = $okAr.Trim() + "`r`n`r`n---" + "`r`n`r`n" + $okEn.Trim()
  Write-Output $ok
  Write-Output ""
  Write-Output "Startup shortcut:"
  Write-Output $lnkPath
  Show-FaltaBox $ok "Info"
  exit 0
} catch {
  $err = $_.Exception.Message
  Write-Output $err
  Show-FaltaBox $err "Error"
  exit 1
}
