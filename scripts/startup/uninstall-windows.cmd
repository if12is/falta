@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -File "%~dp0uninstall-windows.ps1"
echo.
pause
