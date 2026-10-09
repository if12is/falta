# Removes the Falta Startup shortcut. Leaves the repo where it is.
$ErrorActionPreference = "Stop"
$startup = [Environment]::GetFolderPath("Startup")
$lnkPath = Join-Path $startup "Falta.lnk"
if (Test-Path -LiteralPath $lnkPath) {
  Remove-Item -LiteralPath $lnkPath
  Write-Output "Removed:"
  Write-Output $lnkPath
} else {
  Write-Output "No shortcut at:"
  Write-Output $lnkPath
}
