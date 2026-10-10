# Falta settings window. Arabic labels. Layout is saved on this machine.
# The shortcut is fixed: Ctrl+Shift+Y. Start at login is the real Startup shortcut.
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "falta-win.ps1")

$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$hotkey = Join-Path $PSScriptRoot "falta-hotkey.ps1"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Test-FaltaHotkeyRunning {
  $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -and ($_.CommandLine -like "*falta-hotkey.ps1*")
  }
  return [bool]$procs
}

$script:loading = $true
$ink = [System.Drawing.Color]::FromArgb(36, 28, 22)
$paper = [System.Drawing.Color]::FromArgb(247, 243, 236)
$clay = [System.Drawing.Color]::FromArgb(85, 42, 24)

$form = New-Object System.Windows.Forms.Form
$form.Text = "فلتة — الإعدادات"
$form.RightToLeft = [System.Windows.Forms.RightToLeft]::Yes
$form.RightToLeftLayout = $true
$form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::FixedDialog
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$form.StartPosition = [System.Windows.Forms.FormStartPosition]::CenterScreen
$form.ClientSize = New-Object System.Drawing.Size(460, 460)
$form.BackColor = $paper
$form.ForeColor = $ink
$form.Font = New-Object System.Drawing.Font("Segoe UI", 11)

$iconFile = Join-Path $root "extension\icons\icon128.png"
if (Test-Path -LiteralPath $iconFile) {
  try {
    $loaded = [System.Drawing.Bitmap]::FromFile($iconFile)
    $src = New-Object System.Drawing.Bitmap $loaded
    $loaded.Dispose()
    $small = New-Object System.Drawing.Bitmap 32, 32
    $graphics = [System.Drawing.Graphics]::FromImage($small)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($src, 0, 0, 32, 32)
    $graphics.Dispose()
    $form.Icon = [System.Drawing.Icon]::FromHandle($small.GetHicon())
    $script:settingsBitmap = $small
    $script:settingsSource = $src
  } catch {}
}

function Add-FaltaLabel {
  param([string]$Text, [int]$Y, [int]$Height, [bool]$Bold = $false)
  $label = New-Object System.Windows.Forms.Label
  $label.Text = $Text
  $label.ForeColor = $ink
  $label.BackColor = $paper
  $label.Location = New-Object System.Drawing.Point(20, $Y)
  $label.Size = New-Object System.Drawing.Size(420, $Height)
  $label.TextAlign = [System.Drawing.ContentAlignment]::MiddleRight
  if ($Bold) {
    $label.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
  }
  $form.Controls.Add($label)
  return $label
}

$statusText = "فلتة مش شغالة"
if (Test-FaltaHotkeyRunning) { $statusText = "فلتة شغالة" }
Add-FaltaLabel $statusText 16 32 $true | Out-Null
Add-FaltaLabel "الاختصار: Ctrl+Shift+Y" 52 28 $false | Out-Null
Add-FaltaLabel "الاختصار ثابت ومش بيتغيّر من هنا." 80 28 $false | Out-Null
Add-FaltaLabel "لوحة الكيبورد" 116 28 $false | Out-Null

$radioWin = New-Object System.Windows.Forms.RadioButton
$radioWin.Text = "عربي ١٠١"
$radioWin.Location = New-Object System.Drawing.Point(20, 148)
$radioWin.Size = New-Object System.Drawing.Size(420, 28)
$radioWin.ForeColor = $ink
$radioWin.BackColor = $paper
$form.Controls.Add($radioWin)

$radioMac = New-Object System.Windows.Forms.RadioButton
$radioMac.Text = "عربي الماك"
$radioMac.Location = New-Object System.Drawing.Point(20, 180)
$radioMac.Size = New-Object System.Drawing.Size(420, 28)
$radioMac.ForeColor = $ink
$radioMac.BackColor = $paper
$form.Controls.Add($radioMac)

Add-FaltaLabel "عربي ١٠١ لويندوز ولينكس ولوحة Arabic - PC. عربي الماك للوحة Arabic الأصلية. الصف السفلي هو اللي بيتغير. التغيير يشتغل من القلب الجاي." 212 64 $false | Out-Null

$login = New-Object System.Windows.Forms.CheckBox
$login.Text = "تشغيل مع ويندوز"
$login.Location = New-Object System.Drawing.Point(20, 284)
$login.Size = New-Object System.Drawing.Size(420, 28)
$login.ForeColor = $ink
$login.BackColor = $paper
$form.Controls.Add($login)

Add-FaltaLabel "إلغاء العلامة ما يقفلش البرنامج دلوقتي. خروج من أيقونة فلتة جنب الساعة يوقفه." 316 48 $false | Out-Null

$close = New-Object System.Windows.Forms.Button
$close.Text = "إغلاق"
$close.Location = New-Object System.Drawing.Point(20, 380)
$close.Size = New-Object System.Drawing.Size(420, 40)
$close.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$close.BackColor = $clay
$close.ForeColor = $paper
$close.add_Click({ $script:form.Close() })
$form.Controls.Add($close)
$form.AcceptButton = $close

$script:radioWin = $radioWin
$script:radioMac = $radioMac
$script:login = $login
$script:root = $root
$script:hotkey = $hotkey
$script:form = $form

$layout = Get-FaltaLayout
$script:radioWin.Checked = ($layout -ne "mac")
$script:radioMac.Checked = ($layout -eq "mac")
$script:login.Checked = Test-FaltaLoginShortcut
$script:loading = $false

$script:radioWin.add_CheckedChanged({
  if ($script:loading) { return }
  if ($script:radioWin.Checked) { Set-FaltaLayout "windows" }
})
$script:radioMac.add_CheckedChanged({
  if ($script:loading) { return }
  if ($script:radioMac.Checked) { Set-FaltaLayout "mac" }
})
$script:login.add_CheckedChanged({
  if ($script:loading) { return }
  if ($script:login.Checked) {
    Install-FaltaLoginShortcut -Root $script:root -Hotkey $script:hotkey | Out-Null
  } else {
    Remove-FaltaLoginShortcut | Out-Null
  }
})

[void]$form.ShowDialog()
