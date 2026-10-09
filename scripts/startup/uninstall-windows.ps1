# Removes the Falta Startup hotkey. Leaves the unzipped folder where it is.
$ErrorActionPreference = "Stop"

try { chcp 65001 > $null } catch {}
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
  $_.CommandLine -and ($_.CommandLine -like "*falta-hotkey.ps1*")
}
foreach ($proc in $procs) {
  Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
}

$startup = [Environment]::GetFolderPath("Startup")
$lnkPath = Join-Path $startup "Falta.lnk"
if (Test-Path -LiteralPath $lnkPath) {
  Remove-Item -LiteralPath $lnkPath -Force
  Write-Output "Removed:"
  Write-Output $lnkPath
} else {
  Write-Output "No shortcut at:"
  Write-Output $lnkPath
}

$done = @"
فلتة اتشالت من تشغيل الجهاز. المجلد لسه مكانه.

---

Falta no longer starts with Windows. The folder is still there.
"@
Write-Output $done.Trim()
try {
  Add-Type -AssemblyName System.Windows.Forms
  [System.Windows.Forms.MessageBox]::Show(
    $done.Trim(),
    "Falta",
    [System.Windows.Forms.MessageBoxButtons]::OK,
    [System.Windows.Forms.MessageBoxIcon]::Information
  ) | Out-Null
} catch {}
