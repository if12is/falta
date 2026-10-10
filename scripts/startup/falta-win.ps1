# Shared Windows helpers for the Falta hotkey installer and settings window.
# Dot-source only. Does not open a window.

function Get-FaltaStartupLink {
  return (Join-Path ([Environment]::GetFolderPath("Startup")) "Falta.lnk")
}

function Install-FaltaLoginShortcut {
  param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string]$Hotkey
  )
  $lnkPath = Get-FaltaStartupLink
  $powershell = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"
  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($lnkPath)
  $shortcut.TargetPath = $powershell
  $shortcut.Arguments = "-NoProfile -STA -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$Hotkey`""
  $shortcut.WorkingDirectory = $Root
  $shortcut.WindowStyle = 7
  $shortcut.Description = "Falta — Ctrl+Shift+Y"
  $shortcut.Save()
  return $lnkPath
}

function Remove-FaltaLoginShortcut {
  $lnkPath = Get-FaltaStartupLink
  if (Test-Path -LiteralPath $lnkPath) {
    Remove-Item -LiteralPath $lnkPath -Force
  }
  return $lnkPath
}

function Test-FaltaLoginShortcut {
  return (Test-Path -LiteralPath (Get-FaltaStartupLink))
}

function Get-FaltaSettingsPath {
  return (Join-Path $env:LOCALAPPDATA "Falta\settings.json")
}

function Get-FaltaLayout {
  $path = Get-FaltaSettingsPath
  if (-not (Test-Path -LiteralPath $path)) { return "windows" }
  try {
    $raw = [System.IO.File]::ReadAllText($path)
    $raw = $raw.Trim().TrimStart([char]0xFEFF)
    $obj = $raw | ConvertFrom-Json
    if ($obj.layout -eq "mac") { return "mac" }
  } catch {}
  return "windows"
}

function Set-FaltaLayout {
  param([string]$Layout)
  if ($Layout -ne "mac") { $Layout = "windows" }
  $path = Get-FaltaSettingsPath
  $dir = Split-Path -Parent $path
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  $json = '{"layout":"' + $Layout + '"}' + "`n"
  $utf8 = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText($path, $json, $utf8)
}
