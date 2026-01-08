!include "WinVer.nsh"

!macro customInit
  ; Windows Version Check
  ${If} ${AtLeastWin10}
    ; Windows 10 or higher, continue
  ${Else}
    MessageBox MB_OK|MB_ICONSTOP "Bu uygulama düzgün çalışabilmek için Windows 10 veya daha yeni bir işletim sistemi gerektirir.$\n$\nLütfen sisteminizi güncelleyin."
    Quit
  ${EndIf}

  ; Winget Check
  nsExec::ExecToStack 'cmd /c "winget --version"'
  Pop $0 ; Exit code
  Pop $1 ; Output

  ${If} $0 != 0
    MessageBox MB_YESNO|MB_ICONQUESTION "Sisteminizde 'winget' (Windows Paket Yöneticisi) bulunamadı.$\n$\nWinget, bu uygulamanın çalışması için gereklidir.$\n$\nWinget'i şimdi otomatik olarak yüklemek ister misiniz?$\n$\n(Bu işlem birkaç dakika sürebilir)" IDYES installWinget IDNO skipWinget

  installWinget:
    ; Show progress message
    DetailPrint "Winget yükleniyor, lütfen bekleyin..."
    
    ; Method 1: Try using Add-AppxPackage from Microsoft Store
    nsExec::ExecToStack 'powershell -ExecutionPolicy Bypass -Command "Write-Host ''Winget indiriliyor...''; $ProgressPreference = ''SilentlyContinue''; try { Add-AppxPackage -RegisterByFamilyName -MainPackage Microsoft.DesktopAppInstaller_8wekyb3d8bbwe -ErrorAction Stop; Write-Host ''Basarili'' } catch { Write-Host ''Hata: '' + $_.Exception.Message }"'
    Pop $2 ; Exit code
    Pop $3 ; Output
    
    ; Verify installation
    nsExec::ExecToStack 'cmd /c "winget --version"'
    Pop $4 ; Exit code
    Pop $5 ; Output
    
    ${If} $4 != 0
      ; Method 2: Download from GitHub and install
      DetailPrint "Alternatif yöntem deneniyor..."
      
      ; Download latest winget installer from GitHub
      nsExec::ExecToStack 'powershell -ExecutionPolicy Bypass -Command "$ProgressPreference = ''SilentlyContinue''; $releases = ''https://api.github.com/repos/microsoft/winget-cli/releases/latest''; try { $latestRelease = Invoke-RestMethod -Uri $releases -Method Get -ErrorAction Stop; $msixUrl = ($latestRelease.assets | Where-Object { $_.name -match ''Microsoft.DesktopAppInstaller.*\.msixbundle$'' }).browser_download_url; if ($msixUrl) { $installerPath = \"$env:TEMP\winget-installer.msixbundle\"; Invoke-WebRequest -Uri $msixUrl -OutFile $installerPath -ErrorAction Stop; Add-AppxPackage -Path $installerPath -ErrorAction Stop; Remove-Item $installerPath -Force; Write-Host ''Basarili'' } else { Write-Host ''URL bulunamadi'' } } catch { Write-Host ''Hata: '' + $_.Exception.Message }"'
      Pop $6 ; Exit code
      Pop $7 ; Output
      
      ; Final verification
      nsExec::ExecToStack 'cmd /c "winget --version"'
      Pop $8 ; Exit code
      Pop $9 ; Output
      
      ${If} $8 != 0
        MessageBox MB_YESNO|MB_ICONEXCLAMATION "Winget otomatik olarak yüklenemedi.$\n$\nManuel olarak yüklemek için Microsoft Store'dan 'App Installer' uygulamasını yükleyebilirsiniz.$\n$\nYine de kuruluma devam etmek istiyor musunuz?" IDYES continueAnyway
        Quit
        continueAnyway:
      ${Else}
        MessageBox MB_OK|MB_ICONINFORMATION "Winget başarıyla yüklendi!$\n$\nKurulum devam edecek."
      ${EndIf}
    ${Else}
      MessageBox MB_OK|MB_ICONINFORMATION "Winget başarıyla yüklendi!$\n$\nKurulum devam edecek."
    ${EndIf}
    Goto endWingetCheck

  skipWinget:
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Winget olmadan uygulama düzgün çalışmayacaktır.$\n$\nYine de kuruluma devam etmek istiyor musunuz?" IDYES endWingetCheck
    Quit

  endWingetCheck:
  ${EndIf}
!macroend
