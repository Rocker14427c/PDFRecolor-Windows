// ═══ PDF RECOLOR - WINDOWS DESKTOP RENDERER ═══

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/pdf.worker.min.js';

// ═══ STATE ═══
const state = {
  pdfDoc: null,
  totalPages: 0,
  currentPage: 1,
  zoom: 1.0,
  baseScale: 1.0,
  targetColor: { r: 124, g: 107, b: 240 },
  viewMode: 'colored',
  originalCanvases: {},
  coloredCanvases: {},
  thumbnails: {},
  fileName: '',
  filePath: '',
  isComparing: false,
  lastSavedPath: null
};

// ═══ PRESETS ═══
const PRESETS = [
  { hex: '#7C6BF0', name: 'Purple' },
  { hex: '#4A90E2', name: 'Blue' },
  { hex: '#E74C3C', name: 'Red' },
  { hex: '#2ECC71', name: 'Green' },
  { hex: '#F39C12', name: 'Amber' },
  { hex: '#E91E63', name: 'Pink' },
  { hex: '#00BCD4', name: 'Cyan' },
  { hex: '#1A1A2E', name: 'Dark' },
  { hex: '#FF6B35', name: 'Orange' },
  { hex: '#000000', name: 'Black' }
];

// ═══ DOM ELEMENTS ═══
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const uploadScreen = $('#upload-screen');
const editorScreen = $('#editor-screen');
const dropZone = $('#dropZone');
const browseBtn = $('#browseBtn');
const previewCanvas = $('#previewCanvas');
const previewFrame = $('#previewFrame');
const previewWrap = $('#previewWrap');
const hexInput = $('#hexInput');
const nativeColorPicker = $('#nativeColorPicker');
const swatchBtn = $('#swatchBtn');
const presetsEl = $('#colorPresets');
const loadingOverlay = $('#loadingOverlay');
const loadingText = $('#loadingText');
const loadingSub = $('#loadingSub');
const progressFill = $('#progressFill');
const compareIndicator = $('#compareIndicator');
const fileNameEl = $('#fileName');
const pageInfoEl = $('#pageInfo');
const pageIndicator = $('#pageIndicator');
const thumbnailsStrip = $('#thumbnailsStrip');
const exportBtn = $('#exportBtn');
const exportInfo = $('#exportInfo');
const zoomLevelEl = $('#zoomLevel');
const viewColored = $('#viewColored');
const viewOriginal = $('#viewOriginal');

// ═══ INITIALIZATION ═══
document.addEventListener('DOMContentLoaded', () => {
  initPresets();
  initEventListeners();
  initDragAndDrop();
});

// ═══ PRESETS ═══
function initPresets() {
  presetsEl.innerHTML = '';
  PRESETS.forEach(p => {
    const chip = document.createElement('div');
    chip.className = 'preset-chip';
    chip.style.background = p.hex;
    chip.dataset.hex = p.hex;
    chip.title = p.name;
    chip.addEventListener('click', () => setColor(p.hex));
    presetsEl.appendChild(chip);
  });
  setColor('7C6BF0');
}

// ═══ EVENT LISTENERS ═══
function initEventListeners() {
  // File picking
  dropZone.addEventListener('click', openFileDialog);
  browseBtn.addEventListener('click', openFileDialog);
  
  // New file
  $('#newFileBtn').addEventListener('click', () => switchScreen('upload'));
  
  // Color controls
  hexInput.addEventListener('input', handleHexInput);
  hexInput.addEventListener('blur', handleHexBlur);
  nativeColorPicker.addEventListener('input', (e) => setColor(e.target.value));
  
  // Page navigation
  $('#prevPage').addEventListener('click', () => navigatePage(-1));
  $('#nextPage').addEventListener('click', () => navigatePage(1));
  
  // Zoom controls
  $('#zoomIn').addEventListener('click', () => setZoom(state.zoom * 1.25));
  $('#zoomOut').addEventListener('click', () => setZoom(state.zoom / 1.25));
  $('#zoomFit').addEventListener('click', fitToWindow);
  
  // View toggle
  viewColored.addEventListener('click', () => setViewMode('colored'));
  viewOriginal.addEventListener('click', () => setViewMode('original'));
  
  // Export
  exportBtn.addEventListener('click', exportPDF);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);
  
  // Mouse wheel zoom
  previewWrap.addEventListener('wheel', handleWheelZoom, { passive: false });
  
  // Compare with right-click or spacebar
  previewFrame.addEventListener('mousedown', handleMouseDown);
  previewFrame.addEventListener('mouseup', handleMouseUp);
  previewFrame.addEventListener('mouseleave', handleMouseUp);
  
  // Window resize
  window.addEventListener('resize', debounce(handleResize, 200));
}

// ═══ DRAG AND DROP ═══
function initDragAndDrop() {
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Highlight drop zone
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
  });

  function highlight(e) {
    dropZone.classList.add('dragover');
  }

  function unhighlight(e) {
    dropZone.classList.remove('dragover');
  }

  // Handle drop
  document.body.addEventListener('drop', handleDrop, false);
}

async function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length > 0) {
    const file = files[0];
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      await loadPDF(file);
    } else {
      showToast('Please drop a PDF file', 'error');
    }
  }
}

// ═══ FILE OPERATIONS ═══
async function openFileDialog() {
  try {
    const result = await window.electronAPI.openFileDialog();
    if (result) {
      const binaryString = atob(result.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const file = new File([blob], result.fileName, { type: 'application/pdf' });
      state.filePath = result.filePath;
      await loadPDF(file);
    }
  } catch (err) {
    showToast('Error opening file: ' + err.message, 'error');
  }
}

// ═══ LOAD PDF ═══
async function loadPDF(file) {
  showLoading('Loading PDF…', 'Parsing document');
  state.fileName = file.name;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    state.pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
    state.totalPages = state.pdfDoc.numPages;
    state.currentPage = 1;
    state.originalCanvases = {};
    state.coloredCanvases = {};
    state.thumbnails = {};
    
    fileNameEl.textContent = file.name;
    pageInfoEl.textContent = `Pages: ${state.totalPages}`;
    
    switchScreen('editor');
    
    await renderAllThumbnails();
    await showPage(1);
    
    hideLoading();
    showToast('PDF loaded successfully!', 'success');
  } catch (err) {
    hideLoading();
    showToast('Failed to load PDF: ' + err.message, 'error');
  }
}

// ═══ PAGE DISPLAY ═══
async function showPage(pageNum) {
  if (pageNum < 1 || pageNum > state.totalPages) return;
  
  state.currentPage = pageNum;
  updatePageInfo();
  
  // Render page if not cached
  if (!state.originalCanvases[pageNum + '_full']) {
    const page = await state.pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({
      canvasContext: canvas.getContext('2d'),
      viewport
    }).promise;
    state.originalCanvases[pageNum + '_full'] = canvas;
    delete state.coloredCanvases[pageNum];
  }
  
  state.zoom = 1.0;
  renderPreview();
  updateThumbnails();
}

async function renderAllThumbnails() {
  thumbnailsStrip.innerHTML = '';
  
  for (let i = 1; i <= state.totalPages; i++) {
    const thumbBtn = document.createElement('button');
    thumbBtn.className = 'thumb-btn';
    thumbBtn.dataset.page = i;
    thumbBtn.addEventListener('click', () => showPage(i));
    
    const canvas = document.createElement('canvas');
    canvas.width = 60;
    canvas.height = 80;
    
    // Generate thumbnail
    if (!state.thumbnails[i]) {
      const page = await state.pdfDoc.getPage(i);
      const vp = page.getViewport({ scale: 0.25 });
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = vp.width;
      thumbCanvas.height = vp.height;
      await page.render({
        canvasContext: thumbCanvas.getContext('2d'),
        viewport: vp
      }).promise;
      state.thumbnails[i] = thumbCanvas;
    }
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(state.thumbnails[i], 0, 0, canvas.width, canvas.height);
    
    thumbBtn.appendChild(canvas);
    thumbnailsStrip.appendChild(thumbBtn);
  }
}

function updateThumbnails() {
  $$('.thumb-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.page) === state.currentPage);
  });
}

function renderPreview() {
  const original = state.originalCanvases[state.currentPage + '_full'];
  if (!original) return;

  let source;
  if (state.isComparing || state.viewMode === 'original') {
    source = original;
  } else {
    if (!state.coloredCanvases[state.currentPage]) {
      state.coloredCanvases[state.currentPage] = recolorCanvas(original, state.targetColor);
    }
    source = state.coloredCanvases[state.currentPage];
  }

  // Calculate base scale to fit in viewport
  const availW = previewWrap.clientWidth - 48;
  const availH = previewWrap.clientHeight - 48;
  state.baseScale = Math.min(availW / source.width, availH / source.height, 1);
  
  const finalScale = state.baseScale * state.zoom;
  
  previewCanvas.width = source.width;
  previewCanvas.height = source.height;
  previewCanvas.style.width = Math.round(source.width * finalScale) + 'px';
  previewCanvas.style.height = Math.round(source.height * finalScale) + 'px';
  previewCanvas.getContext('2d').drawImage(source, 0, 0);
  
  zoomLevelEl.textContent = Math.round(finalScale * 100) + '%';
}

// ═══ RECOLOR ENGINE ═══
function recolorCanvas(sourceCanvas, color) {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  
  const img = sourceCanvas.getContext('2d').getImageData(0, 0, w, h);
  const d = img.data;
  const { r: tr, g: tg, b: tb } = color;
  
  for (let i = 0; i < d.length; i += 4) {
    // Calculate luminance (perceived brightness)
    const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    
    // Blend target color with white based on luminance
    d[i] = Math.round(tr * (1 - lum) + 255 * lum);
    d[i + 1] = Math.round(tg * (1 - lum) + 255 * lum);
    d[i + 2] = Math.round(tb * (1 - lum) + 255 * lum);
  }
  
  out.getContext('2d').putImageData(img, 0, 0);
  return out;
}

// ═══ COLOR CONTROLS ═══
function setColor(hex) {
  hex = hex.replace('#', '').toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(hex)) return false;
  
  state.targetColor = {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
  
  hexInput.value = hex;
  nativeColorPicker.value = '#' + hex;
  swatchBtn.style.background = '#' + hex;
  
  $$('.preset-chip').forEach(s => {
    s.classList.toggle('active', s.dataset.hex.toUpperCase() === hex);
  });
  
  // Clear colored cache to force re-render
  state.coloredCanvases = {};
  renderPreview();
  
  return true;
}

function handleHexInput() {
  let val = hexInput.value.replace(/[^0-9a-fA-F]/g, '').substring(0, 6);
  hexInput.value = val.toUpperCase();
  if (val.length === 6) setColor(val);
}

function handleHexBlur() {
  let val = hexInput.value.padEnd(6, '0');
  hexInput.value = val.toUpperCase();
  setColor(val);
}

// ═══ PAGE NAVIGATION ═══
function navigatePage(delta) {
  const newPage = state.currentPage + delta;
  if (newPage >= 1 && newPage <= state.totalPages) {
    showPage(newPage);
  }
}

function updatePageInfo() {
  pageIndicator.textContent = `${state.currentPage} / ${state.totalPages}`;
  $('#prevPage').disabled = state.currentPage <= 1;
  $('#nextPage').disabled = state.currentPage >= state.totalPages;
}

// ═══ ZOOM CONTROLS ═══
function setZoom(newZoom) {
  state.zoom = Math.max(0.25, Math.min(4, newZoom));
  renderPreview();
}

function fitToWindow() {
  state.zoom = 1.0;
  renderPreview();
}

function handleWheelZoom(e) {
  if (e.ctrlKey) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(state.zoom * delta);
  }
}

// ═══ VIEW MODE ═══
function setViewMode(mode) {
  state.viewMode = mode;
  viewColored.classList.toggle('active', mode === 'colored');
  viewOriginal.classList.toggle('active', mode === 'original');
  renderPreview();
}

// ═══ COMPARE MODE ═══
let compareTimer = null;

function handleMouseDown(e) {
  if (e.button === 2 || e.button === 0) { // Right-click or left-click hold
    compareTimer = setTimeout(() => {
      state.isComparing = true;
      compareIndicator.classList.add('visible');
      previewFrame.classList.add('comparing');
      compareIndicator.textContent = 'Showing: Original';
      renderPreview();
    }, 300);
  }
}

function handleMouseUp(e) {
  clearTimeout(compareTimer);
  if (state.isComparing) {
    state.isComparing = false;
    compareIndicator.classList.remove('visible');
    previewFrame.classList.remove('comparing');
    renderPreview();
  }
}

// ═══ KEYBOARD SHORTCUTS ═══
function handleKeyboard(e) {
  if (!state.pdfDoc) return;
  
  switch (e.key) {
    case 'ArrowLeft':
    case 'PageUp':
      navigatePage(-1);
      break;
    case 'ArrowRight':
    case 'PageDown':
      navigatePage(1);
      break;
    case 'Home':
      showPage(1);
      break;
    case 'End':
      showPage(state.totalPages);
      break;
    case '+':
    case '=':
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom(state.zoom * 1.25);
      }
      break;
    case '-':
      if (e.ctrlKey) {
        e.preventDefault();
        setZoom(state.zoom / 1.25);
      }
      break;
    case '0':
      if (e.ctrlKey) {
        e.preventDefault();
        fitToWindow();
      }
      break;
    case ' ':
      if (!e.ctrlKey && !e.target.matches('input')) {
        e.preventDefault();
        state.isComparing = true;
        compareIndicator.classList.add('visible');
        previewFrame.classList.add('comparing');
        compareIndicator.textContent = 'Showing: Original';
        renderPreview();
      }
      break;
  }
}

document.addEventListener('keyup', (e) => {
  if (e.key === ' ' && state.isComparing) {
    state.isComparing = false;
    compareIndicator.classList.remove('visible');
    previewFrame.classList.remove('comparing');
    renderPreview();
  }
});

// ═══ EXPORT PDF ═══
async function exportPDF() {
  if (!state.pdfDoc) return;
  
  const outputName = state.fileName.replace(/\.pdf$/i, '') + '_recolored_' + hexInput.value + '.pdf';
  showLoading('Exporting…', '0 / ' + state.totalPages);
  exportBtn.disabled = true;
  
  try {
    const { PDFDocument } = PDFLib;
    const newPdf = await PDFDocument.create();
    
    for (let i = 1; i <= state.totalPages; i++) {
      updateProgress(i, state.totalPages, 'Exporting…');
      
      // Render page if not cached
      if (!state.originalCanvases[i + '_full']) {
        const page = await state.pdfDoc.getPage(i);
        const vp = page.getViewport({ scale: 2.0 });
        const c = document.createElement('canvas');
        c.width = vp.width;
        c.height = vp.height;
        await page.render({
          canvasContext: c.getContext('2d'),
          viewport: vp
        }).promise;
        state.originalCanvases[i + '_full'] = c;
      }
      
      // Apply recoloring
      const colored = recolorCanvas(state.originalCanvases[i + '_full'], state.targetColor);
      
      // Convert to PNG and embed
      const pngDataUrl = colored.toDataURL('image/png');
      const pngImage = await newPdf.embedPng(pngDataUrl);
      
      // Get original page dimensions
      const pdfPage = await state.pdfDoc.getPage(i);
      const vp = pdfPage.getViewport({ scale: 1.0 });
      
      // Create new page with original dimensions
      const page = newPdf.addPage([vp.width, vp.height]);
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: vp.width,
        height: vp.height
      });
    }
    
    const pdfBytes = await newPdf.save();
    const base64 = arrayBufferToBase64(pdfBytes);
    
    // Try to save to Downloads folder
    const result = await window.electronAPI.saveToDownloads({
      fileName: outputName,
      base64: base64
    });
    
    if (result.success) {
      state.lastSavedPath = result.filePath;
      exportInfo.textContent = 'Saved to Downloads';
      hideLoading();
      showToast('PDF saved to Downloads!', 'success');
      
      // Ask if user wants to open the file location
      setTimeout(() => {
        if (confirm('Export complete! Open the file location?')) {
          window.electronAPI.showInFolder(result.filePath);
        }
      }, 500);
    } else {
      throw new Error(result.error);
    }
  } catch (err) {
    hideLoading();
    showToast('Export failed: ' + err.message, 'error');
  } finally {
    exportBtn.disabled = false;
  }
}

// ═══ UTILITY FUNCTIONS ═══
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function switchScreen(name) {
  if (name === 'editor') {
    uploadScreen.classList.remove('active');
    uploadScreen.classList.add('hidden');
    editorScreen.classList.remove('hidden');
    editorScreen.classList.add('active');
  } else {
    editorScreen.classList.remove('active');
    editorScreen.classList.add('hidden');
    uploadScreen.classList.remove('hidden');
    uploadScreen.classList.add('active');
    resetState();
  }
}

function resetState() {
  state.pdfDoc = null;
  state.totalPages = 0;
  state.currentPage = 1;
  state.originalCanvases = {};
  state.coloredCanvases = {};
  state.thumbnails = {};
  state.fileName = '';
  state.filePath = '';
  state.isComparing = false;
  thumbnailsStrip.innerHTML = '';
  exportInfo.textContent = '';
}

function showLoading(t, s) {
  loadingText.textContent = t;
  loadingSub.textContent = s || '';
  progressFill.style.width = '0%';
  loadingOverlay.classList.add('active');
}

function hideLoading() {
  loadingOverlay.classList.remove('active');
}

function updateProgress(current, total, txt) {
  progressFill.style.width = Math.round((current / total) * 100) + '%';
  if (txt) loadingText.textContent = txt;
  loadingSub.textContent = current + ' / ' + total;
}

function showToast(msg, type = '') {
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icon = type === 'error' ? '✕' : type === 'success' ? '✓' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span> ${msg}`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function handleResize() {
  if (state.pdfDoc) {
    renderPreview();
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Prevent context menu on preview
previewFrame.addEventListener('contextmenu', (e) => e.preventDefault());
