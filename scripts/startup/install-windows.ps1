# Adds a Startup-folder shortcut that opens the Falta offline page at login.
# Remove it with uninstall-windows.ps1. Does not change the browser or the registry.
$ErrorActionPreference = "Stop"
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$page = Join-Path $root "web\index.html"
if (-not (Test-Path -LiteralPath $page)) {
  throw "Missing $page"
}
$startup = [Environment]::GetFolderPath("Startup")
$lnkPath = Join-Path $startup "Falta.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($lnkPath)
$shortcut.TargetPath = $page
$shortcut.WorkingDirectory = Split-Path -Parent $page
$shortcut.Description = "Falta offline page"
$shortcut.WindowStyle = 1
$shortcut.Save()
Write-Output "Installed startup shortcut:"
Write-Output $lnkPath
Write-Output "Opens:"
Write-Output $page
