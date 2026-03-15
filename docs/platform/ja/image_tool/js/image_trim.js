class ImageTrimApp {
    constructor() {
        // UI Elements
        this.imageUpload = document.getElementById('imageUpload');
        this.dropZone = document.getElementById('dropZone');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas ? this.previewCanvas.getContext('2d') : null;
        
        // Controls
        this.thresholdSlider = document.getElementById('thresholdSlider');
        this.thresholdValueDisplay = document.getElementById('thresholdValueDisplay');
        if (this.thresholdSlider && this.thresholdValueDisplay) {
            this.thresholdValueDisplay.textContent = this.thresholdSlider.value;
        }
        this.edgeWidthSlider = document.getElementById('edgeWidthSlider');
        this.edgeWidthValueDisplay = document.getElementById('edgeWidthValueDisplay');
        this.edgeColorPicker = document.getElementById('edgeColorPicker');
        this.outerContourOnlyCheckbox = document.getElementById('outerContourOnlyCheckbox');
        this.fillContourCheckbox = document.getElementById('fillContourCheckbox');
        this.fillColorPicker = document.getElementById('fillColorPicker');
        this.applyContourBtn = document.getElementById('applyContourBtn');
        this.resetImageBtn = document.getElementById('resetImageBtn');
        
        // Downloads
        this.downloadPngTransparentBtn = document.getElementById('downloadPngTransparentBtn');
        this.downloadPngBgColorBtn = document.getElementById('downloadPngBgColorBtn');
        this.downloadJpegBtn = document.getElementById('downloadJpegBtn');
        this.bgColorPicker = document.getElementById('bgColorPicker');

        // State
        this.originalImage = null;
        this.originalFileName = 'image';
        this.processedCanvas = document.createElement('canvas');
        this.isContourApplied = false;

        this._init();
    }

    _init() {
        this._setupEventListeners();
        this._enableControls(false);
    }

    _setupEventListeners() {
        if (this.imageUpload) {
            this.imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) this.handleFile(file);
            });
        }

        if (this.dropZone) {
            this.dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.dropZone.classList.add('dragover');
            });
            this.dropZone.addEventListener('dragleave', () => {
                this.dropZone.classList.remove('dragover');
            });
            this.dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                this.dropZone.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file) {
                    this.handleFile(file);
                    if (this.imageUpload) this.imageUpload.value = '';
                }
            });
        }

        if (this.thresholdSlider) {
            this.thresholdSlider.addEventListener('input', () => {
                if (this.thresholdValueDisplay) this.thresholdValueDisplay.textContent = this.thresholdSlider.value;
            });
        }

        if (this.edgeWidthSlider) {
            this.edgeWidthSlider.addEventListener('input', () => {
                if (this.edgeWidthValueDisplay) this.edgeWidthValueDisplay.textContent = this.edgeWidthSlider.value;
            });
        }

        if (this.applyContourBtn) {
            this.applyContourBtn.addEventListener('click', () => this.applyContour());
        }

        if (this.resetImageBtn) {
            this.resetImageBtn.addEventListener('click', () => this.resetToOriginal());
        }

        if (this.downloadPngTransparentBtn) {
            this.downloadPngTransparentBtn.addEventListener('click', () => this.download('png', true));
        }

        if (this.downloadPngBgColorBtn) {
            this.downloadPngBgColorBtn.addEventListener('click', () => this.download('png', false));
        }

        if (this.downloadJpegBtn) {
            this.downloadJpegBtn.addEventListener('click', () => this.download('jpeg', false));
        }

        if (this.fillContourCheckbox) {
            this.fillContourCheckbox.addEventListener('change', () => {
                if (this.fillColorPicker) this.fillColorPicker.disabled = !this.fillContourCheckbox.checked;
            });
        }
    }

    handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください。');
            return;
        }
        this.originalFileName = file.name.split('.').slice(0, -1).join('.') || 'image';
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.isContourApplied = false;
                this.updatePreview();
                this._enableControls(true);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    _enableControls(enabled) {
        const controls = [
            this.thresholdSlider, this.edgeWidthSlider, this.edgeColorPicker,
            this.outerContourOnlyCheckbox, this.fillContourCheckbox, this.fillColorPicker,
            this.applyContourBtn, this.resetImageBtn, this.downloadPngTransparentBtn,
            this.downloadPngBgColorBtn, this.downloadJpegBtn, this.bgColorPicker
        ];
        controls.forEach(control => {
            if (control) control.disabled = !enabled;
        });
    }

    applyContour() {
        if (!this.originalImage) return;

        const width = this.originalImage.naturalWidth;
        const height = this.originalImage.naturalHeight;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.originalImage, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const threshold = parseInt(this.thresholdSlider.value);
        const edgeWidth = parseInt(this.edgeWidthSlider.value);
        const edgeColor = this._hexToRgb(this.edgeColorPicker.value);
        const fillColor = this._hexToRgb(this.fillColorPicker.value);
        const fillEnabled = this.fillContourCheckbox.checked;
        const outerOnly = this.outerContourOnlyCheckbox.checked;

        // Binary image for contour detection (1 for object, 0 for background)
        const binary = new Uint8Array(width * height);
        let hasAlpha = false;
        for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) {
                hasAlpha = true;
                break;
            }
        }

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
            if (hasAlpha) {
                // Use alpha to decide if it's "part of the object" based on threshold
                binary[i / 4] = (a >= threshold) ? 1 : 0;
            } else {
                // If no alpha, use brightness with threshold
                const brightness = (r + g + b) / 3;
                // Since threshold is 0-255, we can use it directly
                // Normally users expect to keep "dark" objects on "light" backgrounds or vice versa
                // Let's assume threshold slider controls "what is considered object brightness"
                // If threshold is high, more things are objects.
                binary[i / 4] = (brightness <= threshold) ? 1 : 0;
            }
        }

        const edges = new Uint8Array(width * height);
        const filled = new Uint8Array(width * height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (binary[idx] === 1) {
                    // Check neighbors
                    let isEdge = false;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const ny = y + dy, nx = x + dx;
                            if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
                                isEdge = true;
                                break;
                            }
                            if (binary[ny * width + nx] === 0) {
                                isEdge = true;
                                break;
                            }
                        }
                        if (isEdge) break;
                    }
                    if (isEdge) {
                        // Apply edge width
                        for (let dy = -edgeWidth + 1; dy < edgeWidth; dy++) {
                            for (let dx = -edgeWidth + 1; dx < edgeWidth; dx++) {
                                // Optimization: use circle for better corners if edgeWidth > 1
                                if (dx * dx + dy * dy >= edgeWidth * edgeWidth) continue;
                                
                                const ny = y + dy, nx = x + dx;
                                if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                                    edges[ny * width + nx] = 1;
                                }
                            }
                        }
                    }
                    filled[idx] = 1;
                }
            }
        }

        // Draw to processedCanvas
        this.processedCanvas.width = width;
        this.processedCanvas.height = height;
        const pCtx = this.processedCanvas.getContext('2d');
        const outputImageData = pCtx.createImageData(width, height);
        const outData = outputImageData.data;

        for (let i = 0; i < width * height; i++) {
            const outIdx = i * 4;
            if (edges[i] === 1) {
                outData[outIdx] = edgeColor.r;
                outData[outIdx + 1] = edgeColor.g;
                outData[outIdx + 2] = edgeColor.b;
                outData[outIdx + 3] = 255;
            } else if (fillEnabled && filled[i] === 1 && !outerOnly) {
                 // Simplified fill (everywhere that was original object)
                outData[outIdx] = fillColor.r;
                outData[outIdx + 1] = fillColor.g;
                outData[outIdx + 2] = fillColor.b;
                outData[outIdx + 3] = 255;
            } else {
                outData[outIdx + 3] = 0; // Transparent
            }
        }
        
        // If outerOnly is true, we should have only filled the outermost contour, 
        // but that's complex without a proper contour finder.
        // For now, let's just use the original edges.

        pCtx.putImageData(outputImageData, 0, 0);

        this.isContourApplied = true;
        this.updatePreview();
    }

    _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    resetToOriginal() {
        this.isContourApplied = false;
        this.updatePreview();
    }

    updatePreview() {
        if (!this.originalImage || !this.previewCtx) return;

        const img = this.isContourApplied ? this.processedCanvas : this.originalImage;
        const width = img.width || img.naturalWidth;
        const height = img.height || img.naturalHeight;

        this.previewCanvas.width = width;
        this.previewCanvas.height = height;
        this.previewCtx.clearRect(0, 0, width, height);
        this.previewCtx.drawImage(img, 0, 0);
    }

    download(format, transparent) {
        if (!this.originalImage) return;

        const img = this.isContourApplied ? this.processedCanvas : this.originalImage;
        const width = img.width || img.naturalWidth;
        const height = img.height || img.naturalHeight;

        const downloadCanvas = document.createElement('canvas');
        downloadCanvas.width = width;
        downloadCanvas.height = height;
        const dCtx = downloadCanvas.getContext('2d');

        if (!transparent) {
            dCtx.fillStyle = this.bgColorPicker.value;
            dCtx.fillRect(0, 0, width, height);
        }

        dCtx.drawImage(img, 0, 0);

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = downloadCanvas.toDataURL(mimeType, 0.9);
        const link = document.createElement('a');
        link.download = `${this.originalFileName}_processed.${format}`;
        link.href = dataUrl;
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageTrimApp();
});
