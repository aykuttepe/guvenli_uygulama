!include "WinVer.nsh"

!macro customInit
  ; Windows Version Check
  ${If} ${AtLeastWin10}
    ; Windows 10 or higher, continue
  ${Else}
    MessageBox MB_OK|MB_ICONSTOP "This application requires Windows 10 or later."
    Quit
  ${EndIf}

  ; Winget Check
  nsExec::ExecToStack 'cmd /c "winget --version"'
  Pop $0 ; Exit code
  Pop $1 ; Output

  ${If} $0 != 0
    MessageBox MB_YESNO|MB_ICONQUESTION "Winget (Windows Package Manager) was not found.$\n$\nWinget is required for this application to work.$\n$\nDo you want to continue anyway?" IDYES continueAnyway
    Quit
    continueAnyway:
  ${EndIf}
!macroend
