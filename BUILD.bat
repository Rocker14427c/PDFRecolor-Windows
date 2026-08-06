@echo off
title PDF Recolor Builder
color 0A
echo.
echo  ██████╗  █████╗ ██████╗ 
echo  ██╔══██╗██╔══██╗██╔══██╗
echo  ██████╔╝███████║██████╔╝
echo  ██╔══██╗██╔══██║██╔══██╗
echo  ██████╔╝██║  ██║██║  ██║
echo  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
echo.
echo  PDF Recolor - Builder
echo  =========================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed!
    echo.
    echo Please install Python first:
    echo 1. Go to https://python.org/downloads
    echo 2. Download Python 3.8 or higher
    echo 3. Run installer and CHECK "Add Python to PATH"
    echo 4. Restart this script
    echo.
    pause
    exit /b 1
)

echo [OK] Python found
python --version

:: Install dependencies
echo.
echo Installing dependencies...
pip install pymupdf pillow pyinstaller -q

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to install dependencies
    echo Try running as Administrator
    pause
    exit /b 1
)

echo [OK] Dependencies installed

:: Clean previous builds
echo.
echo Cleaning previous builds...
if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build
if exist "*.spec" del /q *.spec

:: Build the EXE
echo.
echo Building EXE (this may take 1-2 minutes)...
echo.
pyinstaller --onefile --windowed --name "PDFRecolor" --add-data "PDFRecolor.py;." PDFRecolor.py --noconfirm

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

:: Success!
echo.
echo.
echo  ╔════════════════════════════════════════╗
echo  ║                                        ║
echo  ║   BUILD SUCCESSFUL!                    ║
echo  ║                                        ║
echo  ╚════════════════════════════════════════╝
echo.
echo Your EXE is ready at:
echo.
echo   dist\PDFRecolor.exe
echo.
echo Size: approximately 20-25 MB
echo.
echo Would you like to run it now? (Y/N)
choice /c YN /n
if %errorlevel%==1 start "" "dist\PDFRecolor.exe"

echo.
pause
