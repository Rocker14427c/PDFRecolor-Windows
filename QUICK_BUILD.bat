@echo off
title PDF Recolor - Auto Builder v2
color 0E
cls
echo.
echo  ██████╗  █████╗ ██████╗      ██╗███╗   ██╗    ███████╗██████╗ 
echo  ██╔══██╗██╔══██╗██╔══██╗    ███║████╗  ██║    ██╔════╝██╔══██╗
echo  ██████╔╝███████║██████╔╝    ╚██║██╔██╗ ██║    █████╗  ██████╔╝
echo  ██╔══██╗██╔══██║██╔══██╗     ██║██║╚██╗██║    ██╔══╝  ██╔══██╗
echo  ██████╔╝██║  ██║██║  ██║     ██║██║ ╚████║    ██║     ██║  ██║
echo  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝     ╚═╝╚═╝  ╚═══╝    ╚═╝     ╚═╝  ╚═╝
echo.
echo  ═══════════════════════════════════════════════════════
echo   Lightweight PDF Recolor Tool - Auto Builder
echo  ═══════════════════════════════════════════════════════
echo.
echo  This will download Python and build your EXE automatically.
echo  Internet connection required.
echo.

set /p CONFIRM="Press ENTER to start or close this window to cancel..."

:: Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

:: Create build folder
if not exist "build_temp" mkdir "build_temp"
cd build_temp

:: Download Python embeddable (small ~10MB vs 25MB installer)
echo.
echo [1/4] Downloading Python (10MB)...
powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.5/python-3.11.5-embed-amd64.zip' -OutFile 'python.zip'"
if %errorlevel% neq 0 (
    echo Download failed. Check your internet connection.
    pause
    exit /b 1
)

:: Extract Python
echo.
echo [2/4] Extracting Python...
powershell Expand-Archive -Force python.zip .
del python.zip

:: Fix python3.dll issue
echo.
echo [3/4] Configuring Python...

:: Create python311._pth with proper paths
echo python311.zip > python311._pth
echo . >> python311._pth
echo Lib >> python311._pth
echo Lib\site-packages >> python311._pth
echo Scripts >> python311._pth
echo . >> python311._pth

:: Enable pip by creating get-pip.py
powershell -Command "Invoke-WebRequest -Uri 'https://bootstrap.pypa.io/get-pip.py' -OutFile 'get-pip.py'"

:: Run pip install
echo.
echo [4/4] Installing dependencies (this may take a few minutes)...
call python get-pip.py
call python -m pip install pymupdf pillow pyinstaller

:: Copy source file
copy ..\PDFRecolor.py . >nul

:: Build EXE
echo.
echo Building EXE (this takes 1-3 minutes)...
call python -m PyInstaller --onefile --windowed --name "PDFRecolor" PDFRecolor.py --noconfirm

:: Move EXE to main folder
if exist "dist\PDFRecolor.exe" (
    move "dist\PDFRecolor.exe" "..\PDFRecolor.exe" >nul
    rmdir /s /q dist 2>nul
    rmdir /s /q build 2>nul
    del *.spec 2>nul
)

cd ..

:: Cleanup
rmdir /s /q build_temp 2>nul

:: Check if EXE was created
if exist "PDFRecolor.exe" (
    echo.
    echo.
    echo  ╔══════════════════════════════════════════════════╗
    echo  ║                                                  ║
    echo  ║          BUILD COMPLETE!                        ║
    echo  ║                                                  ║
    echo  ╚══════════════════════════════════════════════════╝
    echo.
    echo  Your EXE: PDFRecolor.exe
    echo.
    echo  Size: ~20-25 MB
    echo.
    set /p RUN="Would you like to run it now? (Y/N): "
    if /i "%RUN%"=="Y" start "" "PDFRecolor.exe"
) else (
    echo.
    echo [ERROR] Build failed. Please try running BUILD.bat instead.
)

echo.
pause
