@echo off
title PDF Recolor - Virtual Env Builder
color 0C
cls
echo.
echo  ╔═══════════════════════════════════════╗
echo  ║  PDF RECOLOR - VIRTUAL ENV BUILDER   ║
echo  ╚═══════════════════════════════════════╝
echo.
echo Using Virtual Environment for cleaner build...
echo.

:: Create venv
if exist "venv" (
    echo Using existing virtual environment...
) else (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate venv
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

:: Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip --quiet

:: Install dependencies
echo.
echo Installing dependencies...
pip install pymupdf pillow pyinstaller --quiet

:: Clean old builds
echo.
echo Cleaning old builds...
if exist "dist" rmdir /s /q dist
if exist "build" rmdir /s /q build
del /q *.spec 2>nul

:: Build
echo.
echo Building EXE (this may take 3-5 minutes)...
echo.

pyinstaller ^
    --onefile ^
    --windowed ^
    --name "PDFRecolor" ^
    --add-data "PDFRecolor.py;." ^
    --noconfirm ^
    --clean ^
    PDFRecolor.py

:: Deactivate venv
call venv\Scripts\deactivate.bat

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    pause
    exit /b 1
)

:: Check result
if exist "dist\PDFRecolor.exe" (
    echo.
    echo.
    echo  ╔══════════════════════════════════════════════════╗
    echo  ║                                                  ║
    echo  ║          BUILD SUCCESSFUL!                       ║
    echo  ║                                                  ║
    echo  ╚══════════════════════════════════════════════════╝
    echo.
    echo  EXE Location: dist\PDFRecolor.exe
    echo.
    
    set /p RUN="Run now? (Y/N): "
    if /i "%RUN%"=="Y" start "" "dist\PDFRecolor.exe"
) else (
    echo.
    echo [ERROR] EXE not found!
)

echo.
pause
