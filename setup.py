"""
PDF Recolor - cx_Freeze Setup
More reliable for building Windows executables
"""
from cx_Freeze import setup, Executable
import sys

build_exe_options = {
    "packages": ["PIL", "fitz", "tkinter"],
    "includes": ["PIL._tkinter_finder"],
    "excludes": ["tkinter"],
    "include_files": ["PDFRecolor.py"],
    "optimize": 2,
}

setup(
    name="PDFRecolor",
    version="1.0.0",
    description="PDF Recolor - Transform PDFs with colors",
    options={"build_exe": build_exe_options},
    executables=[
        Executable(
            "PDFRecolor.py",
            base="Win32GUI",  # No console window
            target_name="PDFRecolor.exe",
        )
    ],
)
