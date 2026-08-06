# PDF Recolor - Lightweight Windows App

<p align="center">
  <img src="https://img.shields.io/badge/Size-~20MB-success?style=for-the-badge" alt="Size">
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge" alt="Python">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License">
</p>

> **Lightweight PDF recoloring tool - only ~20MB!**

---

## 🚀 Build Your EXE

### Build Scripts Available

| Script | When to Use |
|:---|:---|
| `BUILD.bat` | **Start here!** Most common build method |
| `BUILD_VENV.bat` | If BUILD.bat fails - uses virtual environment |
| `BUILD_ALT.bat` | Opens GUI builder (auto-py-to-exe) |
| `DIAGNOSE.bat` | If EXE crashes - helps identify the problem |

### Step-by-Step

```
1. Double-click BUILD.bat
2. Wait 2-5 minutes
3. Get EXE in dist\PDFRecolor.exe
```

---

## 🔧 Troubleshooting

### EXE Crashes or Shows Error

Run `DIAGNOSE.bat` first! It will check:

- [ ] Python is installed correctly
- [ ] All packages are installed
- [ ] Tkinter is available
- [ ] Visual C++ Runtime is present

### Common Fixes

**1. Install Visual C++ Runtime:**
```
Download: https://aka.ms/vs/17/release/vc_redist.x64.exe
```

**2. If Tkinter Error:**
```
Reinstall Python and CHECK "tcl/tk and IDLE"
```

**3. If BUILD.bat Fails:**
```
Try BUILD_VENV.bat instead
```

**4. Using auto-py-to-exe (GUI):**
```
pip install auto-py-to-exe
python -m auto_py_to_exe
```

---

## 📋 Requirements

- Windows 10/11 (64-bit)
- Python 3.8+ (for building)
- Internet connection (for first build)

---

## ✨ Features

- 🎨 Color picker + 10 presets
- 📄 Multi-page PDF support
- 🔍 Zoom & thumbnails
- 💾 Export to any location
- 🌙 Dark theme UI

---

## 📁 Project Files

```
PDFRecolor-Windows/
├── PDFRecolor.py      # Main application (18KB)
├── BUILD.bat          # Main build script
├── BUILD_VENV.bat     # Virtual env builder
├── BUILD_ALT.bat      # GUI builder
├── DIAGNOSE.bat       # Troubleshooting
├── setup.py           # cx_Freeze config
└── README.md
```

---

## 📄 License

MIT License - Free for personal and commercial use
