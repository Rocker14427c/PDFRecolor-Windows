@echo off
title PDF Recolor - Diagnostics
color 0E
cls
echo.
echo  ╔═══════════════════════════════════════╗
echo  ║     PDF RECOLOR - DIAGNOSTICS         ║
echo  ╚═══════════════════════════════════════╝
echo.

echo [CHECK 1] Python Installation
echo =============================
python --version
if %errorlevel% neq 0 (
    echo [FAIL] Python not in PATH
    goto :fix1
)
echo [OK] Python is installed

:fix1
echo.

echo [CHECK 2] Required Packages
echo =============================
pip show pymupdf >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] pymupdf - Installing...
    pip install pymupdf
) else (
    echo [OK] pymupdf
)

pip show pillow >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] pillow - Installing...
    pip install pillow
) else (
    echo [OK] pillow
)

pip show pyinstaller >nul 2>&1
if %errorlevel% neq 0 (
    echo [MISSING] pyinstaller - Installing...
    pip install pyinstaller
) else (
    echo [OK] pyinstaller
)

echo.

echo [CHECK 3] Tkinter
echo =============================
python -c "import tkinter; print('[OK] Tkinter works')" 2>nul
if %errorlevel% neq 0 (
    echo [FAIL] Tkinter is not available!
    echo.
    echo This is usually because:
    echo 1. You installed "Python Core" instead of full Python
    echo 2. Tkinter was excluded during install
    echo.
    echo FIX: Reinstall Python from python.org and ensure
    echo       "tcl/tk and IDLE" is checked.
)

echo.

echo [CHECK 4] Visual C++ Runtime
echo =============================
where vcruntime140.dll >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] vcruntime140.dll not found
    echo.
    echo Download from:
    echo https://aka.ms/vs/17/release/vc_redist.x64.exe
) else (
    echo [OK] Visual C++ Runtime found
)

echo.

echo [SUMMARY]
echo =========
echo.
echo If EXE doesn't work, try:
echo 1. Install Visual C++ Redistributable
echo 2. Run: BUILD_VENV.bat
echo 3. Install auto-py-to-exe: pip install auto-py-to-exe
echo.
echo.

pause
