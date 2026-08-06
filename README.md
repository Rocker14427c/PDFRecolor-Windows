# PDF Recolor - Build Instructions

## Step 1: Install Python (if not already installed)

1. Go to https://www.python.org/downloads
2. Download Python 3.8 or higher
3. **IMPORTANT:** During installation, CHECK "Add Python to PATH"
4. Complete the installation

## Step 2: Build Your EXE

### Method 1: Double-Click (Easiest)
```
Double-click BUILD.bat
```

### Method 2: Manual
```bash
# Open Command Prompt in this folder
pip install pymupdf pillow pyinstaller
pyinstaller --onefile --windowed --name "PDFRecolor" PDFRecolor.py
```

## Step 3: Use Your EXE

Your executable will be created at:
```
dist\PDFRecolor.exe
```

Just double-click to run! No installation needed.

---

## Troubleshooting

### "Python not found"
- Make sure you installed Python with "Add to PATH" checked
- Try restarting your computer after installing Python

### "pip is not recognized"
- Reinstall Python and check "Add Python to PATH"
- Or use: py -m pip install pymupdf pillow

### Build fails
- Try running Command Prompt as Administrator
- Make sure you have stable internet connection

---

## Want a Pre-built EXE?

Unfortunately, I cannot provide a pre-built Windows EXE directly. 
You need to build it once on your Windows PC (takes ~2 minutes).

The source code is very small (18KB) and the build process is fully automated.
