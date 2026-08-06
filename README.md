<p align="center">
  <img src="https://img.shields.io/badge/Size-~20MB-success?style=for-the-badge" alt="Size">
  <img src="https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge" alt="Python">
  <img src="https://img.shields.io/github/v/release/Rocker14427c/PDFRecolor-Windows?style=for-the-badge&include_prereleases" alt="Release">
  <img src="https://img.shields.io/github/license/Rocker14427c/PDFRecolor-Windows?style=for-the-badge" alt="License">
</p>

<h1 align="center">
  <br>
  🎨 PDF Recolor
</h1>

<p align="center">
  <strong>Transform your PDF documents with stunning color schemes</strong>
  <br>
  <sub>A lightweight Windows desktop application - only ~20MB!</sub>
</p>

<br>

<p align="center">
  <a href="#-features"><strong>Features</strong></a> •
  <a href="#-comparison"><strong>Size Comparison</strong></a> •
  <a href="#-getting-started"><strong>Getting Started</strong></a> •
  <a href="#-keyboard-shortcuts"><strong>Shortcuts</strong></a> •
  <a href="#-color-presets"><strong>Color Presets</strong></a>
</p>

---

## ✨ Features

### 🎨 Beautiful Color Controls
- **Native Color Picker** - Pick any color from the full spectrum
- **Hex Code Input** - Enter exact hex codes for precision
- **10 Preset Colors** - Quick access to popular color schemes

### 📄 Powerful PDF Processing
- **Drag & Drop** - Simply drop your PDF files
- **Multi-page Support** - Handle documents up to 100 pages
- **Thumbnail Navigation** - Quick visual page navigation
- **Real-time Preview** - See changes instantly before exporting

### 🔍 Advanced Viewing
- **Zoom Controls** - Zoom in/out with buttons
- **View Toggle** - Switch between colored and original with one click
- **Scroll Navigation** - Smooth scrolling through multi-page documents

### 💾 Easy Export
- **Save Dialog** - Choose where to save your recolored PDF
- **Smart Naming** - Files are named with color code for easy identification

---

## 📊 Size Comparison

| Version | Size | Notes |
|:---|:---:|:---|
| ~~Electron (Original)~~ | ~~168 MB~~ | ❌ Bundles entire Chromium |
| **Python (Current)** | **~20 MB** | ✅ Native libraries only |

> **93% smaller!** Same features, fraction of the size.

---

## 🚀 Getting Started

### Option 1: Run Directly with Python (No Build)

```bash
# Install dependencies
pip install pymupdf pillow

# Run the application
python PDFRecolor.py
```

### Option 2: Build Your Own EXE

**Windows (Double-click):**
```
Double-click BUILD.bat
```

**OR Manual Build:**
```batch
pip install pymupdf pillow pyinstaller
pyinstaller --onefile --windowed --name "PDFRecolor" PDFRecolor.py
```

Your executable will be in `dist\PDFRecolor.exe`

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| `←` | Previous page |
| `→` | Next page |
| `Ctrl + O` | Open PDF file |
| `Ctrl + S` | Export PDF |

---

## 🎨 Color Presets

| Color | Hex Code | Preview |
|:---:|:---:|:---|
| 🟣 Purple | `#7C6BF0` | ![](https://via.placeholder.com/20/7C6BF0/?text=+) |
| 🔵 Blue | `#4A90E2` | ![](https://via.placeholder.com/20/4A90E2/?text=+) |
| 🔴 Red | `#E74C3C` | ![](https://via.placeholder.com/20/E74C3C/?text=+) |
| 🟢 Green | `#2ECC71` | ![](https://via.placeholder.com/20/2ECC71/?text=+) |
| 🟠 Amber | `#F39C12` | ![](https://via.placeholder.com/20/F39C12/?text=+) |
| 💗 Pink | `#E91E63` | ![](https://via.placeholder.com/20/E91E63/?text=+) |
| 🔵 Cyan | `#00BCD4` | ![](https://via.placeholder.com/20/00BCD4/?text=+) |
| ⚫ Dark | `#1A1A2E` | ![](https://via.placeholder.com/20/1A1A2E/?text=+) |
| 🟠 Orange | `#FF6B35` | ![](https://via.placeholder.com/20/FF6B35/?text=+) |
| ⬛ Black | `#000000` | ![](https://via.placeholder.com/20/000000/?text=+) |

---

## 🔧 Technical Stack

| Technology | Purpose |
|:---|:---|
| **Python 3** | Core application logic |
| **Tkinter** | Native Windows GUI (built-in) |
| **PyMuPDF** | High-performance PDF rendering |
| **Pillow** | Image processing |
| **PyInstaller** | EXE packaging |

---

## 📋 System Requirements

| Requirement | Minimum |
|:---|:---|
| **OS** | Windows 10/11 (64-bit) |
| **Python** | 3.8+ (if running from source) |
| **RAM** | 2 GB |
| **Disk Space** | 100 MB |

---

## 📁 Project Structure

```
PDFRecolor-Windows/
├── PDFRecolor.py    # Main application (single file!)
├── BUILD.bat        # Build script for Windows
├── README.md        # Documentation
└── .gitignore       # Git ignore file
```

---

## 🔒 Privacy

- **100% Offline Processing** - Your files never leave your computer
- **No Data Collection** - No telemetry or tracking
- **Open Source** - Inspect the code yourself

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

<p align="center">
  <strong>Made with ❤️ for Windows users</strong>
  <br>
  <sub>If you find this project useful, please ⭐ star the repository!</sub>
</p>
