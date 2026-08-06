@echo off
title PDF Recolor Builder
color 0A
echo.
echo  ╔═══════════════════════════════════════╗
echo  ║      PDF RECOLOR BUILDER             ║
echo  ╚═══════════════════════════════════════╝
echo.

:: Check admin rights
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [TIP] Running as Administrator is recommended
    echo.
)

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo.
    echo Please install Python first:
    echo 1. Go to: https://www.python.org/downloads
    echo 2. Download Python 3.8 or newer
    echo 3. IMPORTANT: Check "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo [OK] Python found:
python --version

:: Install dependencies
echo.
echo Installing dependencies (only first time)...
pip install pymupdf pillow pyinstaller --upgrade --quiet

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install packages
    echo.
    echo Try these steps:
    echo 1. Run this script as Administrator
    echo 2. Check your internet connection
    echo.
    pause
    exit /b 1
)

echo [OK] Dependencies installed

:: Clean old builds
echo.
echo Cleaning old builds...
if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build
del /q *.spec 2>nul

:: Build with better settings
echo.
echo Building EXE...
echo This takes 2-5 minutes. Please wait...
echo.

pyinstaller ^
    --onefile ^
    --windowed ^
    --name "PDFRecolor" ^
    --add-data "PDFRecolor.py;." ^
    --hidden-import=tkinter ^
    --hidden-import=PIL ^
    --hidden-import=fitz ^
    --collect-all=PIL ^
    --collect-all=fitz ^
    --noconfirm ^
    --clean ^
    PDFRecolor.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    echo Common fixes:
    echo 1. Update pip: pip install --upgrade pip
    echo 2. Run as Administrator
    echo 3. Install Visual C++ Redistributable
    echo.
    pause
    exit /b 1
)

:: Check if EXE exists
if not exist "dist\PDFRecolor.exe" (
    echo.
    echo [ERROR] EXE was not created!
    echo.
    pause
    exit /b 1
)

:: Get file size
for %%A in ("dist\PDFRecolor.exe") do set "SIZE=%%~zA"
set /a MB=%SIZE:~0,-6%/1000

echo.
echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║                                                  ║
echo  ║          BUILD SUCCESSFUL!                       ║
echo  ║                                                  ║
echo  ╚══════════════════════════════════════════════════╝
echo.
echo  Location: dist\PDFRecolor.exe
echo  Size: ~%MB% MB
echo.

set /p RUN="Would you like to run it now? (Y/N): "
if /i "%RUN%"=="Y" start "" "dist\PDFRecolor.exe"

echo.
pause
