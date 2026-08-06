@echo off
title PDF Recolor - Alternative Builder
color 0B
cls
echo.
echo  ╔═══════════════════════════════════════╗
echo  ║   PDF RECOLOR - ALTERNATIVE BUILDER   ║
echo  ╚═══════════════════════════════════════╝
echo.
echo This script uses auto-py-to-exe for better results.
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found!
    pause
    exit /b 1
)

echo [OK] Python found

:: Install auto-py-to-exe
echo.
echo Installing auto-py-to-exe...
pip install auto-py-to-exe --quiet

if %errorlevel% neq 0 (
    echo.
    echo Failed to install. Trying manual method...
    goto :manual
)

echo.
echo [OK] auto-py-to-exe installed
echo.
echo ===============================================
echo.
echo AUTO-PY-TO-EXE SETUP:
echo.
echo 1. A window will open
echo 2. Click "Browse" and select: PDFRecolor.py
echo 3. Select: "One File" and "Window Based"
echo 4. Click "Convert .PY to .EXE"
echo.
echo ===============================================
echo.
pause

:: Launch auto-py-to-exe
python -m auto_py_to_exe

goto :end

:manual
echo.
echo MANUAL METHOD:
echo.
echo 1. Install pyinstaller:
echo    pip install pyinstaller
echo.
echo 2. Run this command:
echo    pyinstaller --onefile --windowed --name PDFRecolor PDFRecolor.py
echo.
echo 3. Your EXE will be in the dist folder

:end
echo.
pause
