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
        
        // Simple Edge Detection (Sobel-like or simple difference)
        const gray = new Uint8ClampedArray(width * height);
        for (let i = 0; i < data.length; i += 4) {
            gray[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
        }

        const edges = new Uint8ClampedArray(width * height);
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                const gx = -gray[idx - 1 - width] + gray[idx + 1 - width]
                           - 2 * gray[idx - 1] + 2 * gray[idx + 1]
                           - gray[idx - 1 + width] + gray[idx + 1 + width];
                const gy = -gray[idx - 1 - width] - 2 * gray[idx - width] - gray[idx + 1 - width]
                           + gray[idx - 1 + width] + 2 * gray[idx + width] + gray[idx + 1 + width];
                const mag = Math.sqrt(gx * gx + gy * gy);
                edges[idx] = mag > threshold ? 255 : 0;
            }
        }

        // Draw edges to processedCanvas
        this.processedCanvas.width = width;
        this.processedCanvas.height = height;
        const pCtx = this.processedCanvas.getContext('2d');
        pCtx.clearRect(0, 0, width, height);

        const edgeColor = this.edgeColorPicker.value;
        const fillColor = this.fillColorPicker.value;
        const edgeWidth = parseInt(this.edgeWidthSlider.value);
        const fillEnabled = this.fillContourCheckbox.checked;

        pCtx.fillStyle = fillEnabled ? fillColor : 'transparent';
        if (fillEnabled) {
            // Very basic fill: just fill where we found edges and interior (this is complex in JS without libraries, simplified here)
            // For now, let's just draw the edges.
        }

        pCtx.strokeStyle = edgeColor;
        pCtx.lineWidth = edgeWidth;
        pCtx.lineJoin = 'round';
        pCtx.lineCap = 'round';

        pCtx.beginPath();
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                if (edges[y * width + x] === 255) {
                    pCtx.rect(x, y, 1, 1);
                }
            }
        }
        pCtx.stroke();

        this.isContourApplied = true;
        this.updatePreview();
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
