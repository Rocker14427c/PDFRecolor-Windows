"""
PDF Recolor - Lightweight Windows Desktop App
Single-file Python application (~15MB when packaged)
Run directly or build with PyInstaller: pyinstaller --onefile PDFRecolor.py
"""

import tkinter as tk
from tkinter import filedialog, messagebox, colorchooser
import os
import io
from PIL import Image, ImageTk
import fitz

VERSION = "1.0.0"

class PDFRecolor:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title(f"PDF Recolor v{VERSION}")
        self.root.geometry("1000x700")
        self.root.minsize(800, 600)
        self.root.configure(bg='#1a1b2e')
        
        self.colors = {
            'bg': '#1a1b2e', 'sidebar': '#252640', 'surface': '#2a2b45',
            'primary': '#7c6bf0', 'text': '#f0f0f8', 'text2': '#a0a0c0',
            'border': '#3a3a5a', 'success': '#66bb6a', 'error': '#ef5350'
        }
        
        self.pdf_doc = None
        self.page = 0
        self.total = 0
        self.color = (124, 107, 240)
        self.orig_cache = {}
        self.color_cache = {}
        self.zoom = 1.0
        self.mode = 'colored'
        self.photo = None
        
        self.presets = ['#7C6BF0', '#4A90E2', '#E74C3C', '#2ECC71', '#F39C12', 
                       '#E91E63', '#00BCD4', '#1A1A2E', '#FF6B35', '#000000']
        
        self.setup_ui()
        self.root.bind('<Left>', lambda e: self.nav(-1))
        self.root.bind('<Right>', lambda e: self.nav(1))
        self.root.bind('<Control-o>', lambda e: self.open())
        self.root.mainloop()
    
    def setup_ui(self):
        # Sidebar
        side = tk.Frame(self.root, bg=self.colors['sidebar'], width=260)
        side.pack(side=tk.LEFT, fill=tk.Y)
        
        # Header
        tk.Label(side, text="PDF Recolor", font=('Segoe UI', 14, 'bold'),
                fg=self.colors['text'], bg=self.colors['sidebar']).pack(pady=16)
        
        # File info
        self.file_lbl = tk.Label(side, text="No file loaded", font=('Segoe UI', 10),
                                fg=self.colors['text'], bg=self.colors['bg'])
        self.file_lbl.pack(padx=16, fill=tk.X)
        
        self.page_lbl = tk.Label(side, text="", font=('Segoe UI', 9),
                               fg=self.colors['text2'], bg=self.colors['bg'])
        self.page_lbl.pack(padx=16)
        
        # Color section
        tk.Label(side, text="TARGET COLOR", font=('Segoe UI', 9, 'bold'),
                fg=self.colors['text2'], bg=self.colors['sidebar']).pack(pady=(20, 5))
        
        color_row = tk.Frame(side, bg=self.colors['sidebar'])
        color_row.pack(padx=16, fill=tk.X)
        
        self.color_btn = tk.Canvas(color_row, width=44, height=44, bg='#7c6bf0',
                                  highlightthickness=0, cursor='hand2')
        self.color_btn.create_rectangle(0, 0, 44, 44, outline=self.colors['border'])
        self.color_btn.pack(side=tk.LEFT)
        self.color_btn.bind('<Button-1>', lambda e: self.pick_color())
        
        hex_frame = tk.Frame(color_row, bg=self.colors['surface'], padx=8)
        hex_frame.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(10, 0))
        
        tk.Label(hex_frame, text="#", font=('Consolas', 12, 'bold'),
                fg=self.colors['text2'], bg=self.colors['surface']).pack(side=tk.LEFT)
        
        self.hex_ent = tk.Entry(hex_frame, font=('Consolas', 12, 'bold'),
                               bg=self.colors['surface'], fg=self.colors['text'],
                               insertbackground=self.colors['text'], relief=tk.FLAT)
        self.hex_ent.pack(side=tk.LEFT, fill=tk.X, expand=True)
        self.hex_ent.insert(0, '7C6BF0')
        self.hex_ent.bind('<KeyRelease>', self.hex_changed)
        self.hex_ent.bind('<FocusOut>', self.hex_changed)
        
        # Presets
        tk.Label(side, text="PRESETS", font=('Segoe UI', 9, 'bold'),
                fg=self.colors['text2'], bg=self.colors['sidebar']).pack(pady=(20, 5))
        
        preset_frame = tk.Frame(side, bg=self.colors['sidebar'])
        preset_frame.pack(padx=16)
        
        for i, hex_c in enumerate(self.presets):
            row, col = i // 5, i % 5
            btn = tk.Canvas(preset_frame, width=24, height=24, bg=hex_c,
                           highlightthickness=0, cursor='hand2')
            btn.create_oval(2, 2, 22, 22, outline='gray')
            btn.grid(row=row, column=col, padx=4, pady=4)
            btn.bind('<Button-1>', lambda e, h=hex_c: self.set_color(h))
        
        # Navigation
        tk.Label(side, text="NAVIGATION", font=('Segoe UI', 9, 'bold'),
                fg=self.colors['text2'], bg=self.colors['sidebar']).pack(pady=(20, 5))
        
        nav = tk.Frame(side, bg=self.colors['sidebar'])
        nav.pack(padx=16)
        
        self.prev_btn = tk.Button(nav, text="Prev", bg=self.colors['surface'],
                                fg=self.colors['text'], relief=tk.FLAT, width=8,
                                command=lambda: self.nav(-1), state=tk.DISABLED)
        self.prev_btn.pack(side=tk.LEFT)
        
        self.page_info = tk.Label(nav, text="0 / 0", font=('Segoe UI', 10, 'bold'),
                                 fg=self.colors['text'], bg=self.colors['sidebar'])
        self.page_info.pack(side=tk.LEFT, padx=10)
        
        self.next_btn = tk.Button(nav, text="Next", bg=self.colors['surface'],
                                fg=self.colors['text'], relief=tk.FLAT, width=8,
                                command=lambda: self.nav(1), state=tk.DISABLED)
        self.next_btn.pack(side=tk.LEFT)
        
        # Export button
        spacer = tk.Frame(side)
        spacer.pack(fill=tk.BOTH, expand=True)
        
        self.export_btn = tk.Button(side, text="Export PDF", font=('Segoe UI', 11, 'bold'),
                                   bg=self.colors['primary'], fg='white',
                                   relief=tk.FLAT, pady=12, state=tk.DISABLED,
                                   command=self.export)
        self.export_btn.pack(padx=16, pady=16, fill=tk.X)
        
        # Main content
        content = tk.Frame(self.root, bg=self.colors['bg'])
        content.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        # Toolbar
        toolbar = tk.Frame(content, bg=self.colors['sidebar'], height=45)
        toolbar.pack(fill=tk.X)
        toolbar.pack_propagate(False)
        
        zoom_frame = tk.Frame(toolbar, bg=self.colors['sidebar'])
        zoom_frame.pack(side=tk.LEFT, padx=12)
        
        tk.Button(zoom_frame, text="-", font=('Segoe UI', 14), bg=self.colors['surface'],
                 fg=self.colors['text'], relief=tk.FLAT, width=3,
                 command=lambda: self.zoom(0.8)).pack(side=tk.LEFT)
        
        self.zoom_lbl = tk.Label(zoom_frame, text="100%", font=('Segoe UI', 9),
                                fg=self.colors['text2'], bg=self.colors['sidebar'], width=5)
        self.zoom_lbl.pack(side=tk.LEFT, padx=6)
        
        tk.Button(zoom_frame, text="+", font=('Segoe UI', 14), bg=self.colors['surface'],
                 fg=self.colors['text'], relief=tk.FLAT, width=3,
                 command=lambda: self.zoom(1.25)).pack(side=tk.LEFT)
        
        view_frame = tk.Frame(toolbar, bg=self.colors['surface'], padx=3, pady=3)
        view_frame.pack(side=tk.RIGHT, padx=12)
        
        self.colored_btn = tk.Button(view_frame, text="Colored", font=('Segoe UI', 9),
                                   bg=self.colors['primary'], fg='white',
                                   relief=tk.FLAT, command=lambda: self.set_mode('colored'))
        self.colored_btn.pack(side=tk.LEFT)
        
        self.orig_btn = tk.Button(view_frame, text="Original", font=('Segoe UI', 9),
                                 bg=self.colors['bg'], fg=self.colors['text2'],
                                 relief=tk.FLAT, command=lambda: self.set_mode('original'))
        self.orig_btn.pack(side=tk.LEFT)
        
        # Drop zone
        self.drop_frame = tk.Frame(content, bg=self.colors['bg'])
        self.drop_frame.pack(fill=tk.BOTH, expand=True)
        
        drop = tk.Frame(self.drop_frame, bg=self.colors['surface'], padx=60, pady=60)
        drop.pack(expand=True)
        
        tk.Label(drop, text="PDF", font=('Segoe UI', 48),
                bg=self.colors['surface'], fg=self.colors['text2']).pack()
        
        tk.Label(drop, text="Drop PDF here or click to browse",
                font=('Segoe UI', 14), bg=self.colors['surface'],
                fg=self.colors['text']).pack(pady=20)
        
        tk.Button(drop, text="Choose PDF File", font=('Segoe UI', 11, 'bold'),
                 bg=self.colors['primary'], fg='white', relief=tk.FLAT,
                 padx=30, pady=10, command=self.open).pack()
        
        tk.Label(drop, text="Supports PDFs up to 100 pages",
                font=('Segoe UI', 9), bg=self.colors['surface'],
                fg=self.colors['text2']).pack(pady=(20, 0))
        
        # Canvas area
        self.canvas_frame = tk.Frame(content, bg=self.colors['bg'])
        
        self.canvas = tk.Canvas(self.canvas_frame, bg='#1e1f33', highlightthickness=0)
        self.h_scroll = tk.Scrollbar(self.canvas_frame, orient=tk.HORIZONTAL)
        self.v_scroll = tk.Scrollbar(self.canvas_frame, orient=tk.VERTICAL)
        
        self.canvas.configure(xscrollcommand=self.h_scroll.set, yscrollcommand=self.v_scroll.set)
        self.h_scroll.configure(command=self.canvas.xview)
        self.v_scroll.configure(command=self.canvas.yview)
        
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.h_scroll.pack(side=tk.BOTTOM, fill=tk.X)
        self.v_scroll.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Thumbnail bar
        self.thumb_frame = tk.Frame(content, bg=self.colors['sidebar'], height=80)
        self.thumb_canvas = tk.Canvas(self.thumb_frame, bg=self.colors['sidebar'],
                                     highlightthickness=0)
        self.thumb_scroll = tk.Scrollbar(self.thumb_frame, orient=tk.HORIZONTAL)
        self.thumb_canvas.configure(xscrollcommand=self.thumb_scroll.set)
        self.thumb_scroll.configure(command=self.thumb_canvas.xview)
        
        self.thumb_canvas.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=8, pady=8)
        self.thumb_scroll.pack(fill=tk.X, padx=8)
        
        self.thumbs = []
    
    def hex_to_rgb(self, h):
        h = h.lstrip('#')
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
    
    def rgb_to_hex(self, rgb):
        return '#{:02x}{:02x}{:02x}'.format(*rgb)
    
    def set_color(self, hex_c):
        hex_c = hex_c.lstrip('#').upper()
        self.color = self.hex_to_rgb(hex_c)
        self.color_btn.configure(bg='#' + hex_c)
        self.hex_ent.delete(0, tk.END)
        self.hex_ent.insert(0, hex_c)
        self.color_cache.clear()
        self.render()
    
    def hex_changed(self, e=None):
        val = ''.join(c for c in self.hex_ent.get().upper() if c in '0123456789ABCDEF')[:6]
        if len(val) == 6:
            self.set_color(val)
    
    def pick_color(self):
        c = colorchooser.askcolor(self.color)
        if c[1]:
            self.set_color(c[1])
    
    def open(self):
        path = filedialog.askopenfilename(filetypes=[("PDF", "*.pdf")])
        if path:
            self.load(path)
    
    def load(self, path):
        try:
            self.pdf_doc = fitz.open(path)
            self.total = len(self.pdf_doc)
            self.page = 0
            self.orig_cache.clear()
            self.color_cache.clear()
            
            self.file_lbl.configure(text=os.path.basename(path))
            self.page_lbl.configure(text=f"Pages: {self.total}")
            self.page_info.configure(text=f"{self.page + 1} / {self.total}")
            
            self.export_btn.configure(state=tk.NORMAL)
            self.drop_frame.pack_forget()
            self.canvas_frame.pack(fill=tk.BOTH, expand=True)
            self.thumb_frame.pack(fill=tk.X, side=tk.BOTTOM)
            
            self.render_thumbs()
            self.render()
        except Exception as e:
            messagebox.showerror("Error", str(e))
    
    def render_thumbs(self):
        for w in self.thumb_canvas.winfo_children():
            w.destroy()
        self.thumbs.clear()
        
        x = 5
        for i in range(self.total):
            pix = self.pdf_doc[i].get_pixmap(matrix=fitz.Matrix(0.12, 0.12))
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            photo = ImageTk.PhotoImage(img)
            
            frame = tk.Frame(self.thumb_canvas, bg=self.colors['surface'], padx=2, pady=2)
            label = tk.Label(frame, image=photo, bg='white')
            label.pack()
            
            def go(p=i):
                self.page = p
                self.render()
                self.update_nav()
            
            label.bind('<Button-1>', lambda e, p=i: go(p))
            frame.bind('<Button-1>', lambda e, p=i: go(p))
            
            id = self.thumb_canvas.create_window(x, 5, anchor='nw', window=frame)
            frame.image = photo
            self.thumbs.append({'frame': frame, 'id': id})
            x += 65
        
        self.thumb_canvas.configure(scrollregion=(0, 0, x + 10, 70))
    
    def render(self):
        if not self.pdf_doc:
            return
        
        cache_key = self.page
        if self.mode == 'colored':
            if cache_key not in self.color_cache:
                pix = self.pdf_doc[self.page].get_pixmap(matrix=fitz.Matrix(2 * self.zoom, 2 * self.zoom))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                img = self.recolor(img)
                self.color_cache[cache_key] = img
            img = self.color_cache[cache_key]
        else:
            if cache_key not in self.orig_cache:
                pix = self.pdf_doc[self.page].get_pixmap(matrix=fitz.Matrix(2 * self.zoom, 2 * self.zoom))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                self.orig_cache[cache_key] = img
            img = self.orig_cache[cache_key]
        
        self.photo = ImageTk.PhotoImage(img)
        self.canvas.delete("all")
        self.canvas.create_image(10, 10, anchor='nw', image=self.photo)
        self.canvas.configure(scrollregion=(0, 0, img.width + 20, img.height + 20))
    
    def recolor(self, img):
        pixels = img.load()
        r, g, b = self.color
        for y in range(img.height):
            for x in range(img.width):
                px = pixels[x, y]
                lum = (0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2]) / 255
                pixels[x, y] = (
                    int(r * (1 - lum) + 255 * lum),
                    int(g * (1 - lum) + 255 * lum),
                    int(b * (1 - lum) + 255 * lum)
                )
        return img
    
    def nav(self, delta):
        new = self.page + delta
        if 0 <= new < self.total:
            self.page = new
            self.render()
            self.update_nav()
    
    def update_nav(self):
        self.page_info.configure(text=f"{self.page + 1} / {self.total}")
        self.prev_btn.configure(state=tk.NORMAL if self.page > 0 else tk.DISABLED)
        self.next_btn.configure(state=tk.NORMAL if self.page < self.total - 1 else tk.DISABLED)
        
        for i, t in enumerate(self.thumbs):
            t['frame'].configure(bg=self.colors['primary'] if i == self.page else self.colors['surface'])
    
    def zoom(self, factor):
        self.zoom = max(0.25, min(4, self.zoom * factor))
        self.zoom_lbl.configure(text=f"{int(self.zoom * 100)}%")
        self.orig_cache.clear()
        self.color_cache.clear()
        self.render()
    
    def set_mode(self, mode):
        self.mode = mode
        if mode == 'colored':
            self.colored_btn.configure(bg=self.colors['primary'], fg='white')
            self.orig_btn.configure(bg=self.colors['bg'], fg=self.colors['text2'])
        else:
            self.orig_btn.configure(bg=self.colors['primary'], fg='white')
            self.colored_btn.configure(bg=self.colors['bg'], fg=self.colors['text2'])
        self.render()
    
    def export(self):
        if not self.pdf_doc:
            return
        
        name = os.path.splitext(os.path.basename(self.pdf_doc.name))[0]
        hex_c = self.rgb_to_hex(self.color)[1:]
        out_path = filedialog.asksaveasfilename(
            defaultextension='.pdf',
            initialfile=f"{name}_recolored_{hex_c}.pdf",
            filetypes=[("PDF", "*.pdf")]
        )
        
        if not out_path:
            return
        
        try:
            new_pdf = fitz.open()
            for i in range(self.total):
                pix = self.pdf_doc[i].get_pixmap(matrix=fitz.Matrix(2, 2))
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                img = self.recolor(img)
                
                buf = io.BytesIO()
                img.save(buf, 'PNG')
                
                rect = self.pdf_doc[i].rect
                page = new_pdf.new_page(width=rect.width, height=rect.height)
                page.insert_image(fitz.Rect(0, 0, rect.width, rect.height), stream=buf.getvalue())
            
            new_pdf.save(out_path)
            new_pdf.close()
            messagebox.showinfo("Success", f"Saved to:\n{out_path}")
        except Exception as e:
            messagebox.showerror("Error", str(e))


if __name__ == "__main__":
    PDFRecolor()
