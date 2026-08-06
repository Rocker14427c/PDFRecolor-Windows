@echo off
echo ================================================
echo   PDF Recolor - Build Script
echo ================================================
echo.

echo Installing dependencies...
pip install pymupdf pillow pyinstaller

echo.
echo Building executable...
pyinstaller --onefile --windowed --name "PDFRecolor" --icon=NONE PDFRecolor.py

echo.
echo ================================================
echo   Build Complete!
echo ================================================
echo.
echo Your executable is in: dist\PDFRecolor.exe
echo.
echo To run: dist\PDFRecolor.exe
pause
