class ImageMergeApp {
    constructor() {
        // UI Elements
        this.baseImageUpload = document.getElementById('baseImageUpload');
        this.overlayImageUpload = document.getElementById('overlayImageUpload');
        this.dropZone = document.getElementById('dropZone');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas ? this.previewCanvas.getContext('2d') : null;
        
        // Overlay Controls
        this.opacitySlider = document.getElementById('opacitySlider');
        this.opacityValueDisplay = document.getElementById('opacityValueDisplay');
        this.positionXInput = document.getElementById('positionX');
        this.positionXSlider = document.getElementById('positionXSlider');
        this.positionYInput = document.getElementById('positionY');
        this.positionYSlider = document.getElementById('positionYSlider');
        
        // Download Buttons
        this.downloadPngTransparentBtn = document.getElementById('downloadPngTransparentBtn');
        this.downloadPngBgColorBtn = document.getElementById('downloadPngBgColorBtn');
        this.downloadJpegBtn = document.getElementById('downloadJpegBtn');
        
        // Managers
        this.colorManager = new ColorManager(document.getElementById('bgColorPicker'));
        
        this.baseLayerManager = new BaseLayerManager(
            document.getElementById('baseWidth'), null,
            document.getElementById('baseHeight'), null,
            document.getElementById('baseAspectRatioLock'),
            (w, h) => {
                // When base size changes, update slider ranges
                if (this.overlayImage) {
                    const overlayDim = this.overlayLayerManager.getDimensions();
                    this.positionXSlider.max = w;
                    this.positionYSlider.max = h;
                }
                this.updatePreview();
            }
        );
        
        this.overlayLayerManager = new ImageLayerManager(
            document.getElementById('overlayScalePercentage'), document.getElementById('overlayScaleDisplay'),
            document.getElementById('overlayWidth'), document.getElementById('overlayHeight'),
            document.getElementById('overlayAspectRatioLock'),
            (w, h) => {
                // When overlay size changes, update slider ranges
                const baseDim = this.baseLayerManager.getDimensions();
                this.positionXSlider.min = -w;
                this.positionXSlider.max = baseDim.width;
                this.positionYSlider.min = -h;
                this.positionYSlider.max = baseDim.height;
                this.updatePreview();
            }
        );
        
        // State
        this.baseImage = null;
        this.overlayImage = null;
        this.baseFileName = 'base';
        
        this._init();
    }

    _init() {
        this._setupEventListeners();
        this._enableControls(false);
        this._enableOverlayControls(false);
    }

    _setupEventListeners() {
        // Base Image Upload
        this.baseImageUpload.addEventListener('change', (e) => this._handleBaseFile(e.target.files[0]));
        
        // Overlay Image Upload
        this.overlayImageUpload.addEventListener('change', (e) => this._handleOverlayFile(e.target.files[0]));
        
        // Drag and Drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });
        this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('dragover'));
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) {
                // If base image is not yet uploaded, treat as base
                if (!this.baseImage) {
                    this._handleBaseFile(file);
                } else {
                    this._handleOverlayFile(file);
                }
            }
        });

        // Overlay Controls
        this.opacitySlider.addEventListener('input', () => {
            this.opacityValueDisplay.textContent = this.opacitySlider.value;
            this.updatePreview();
        });
        
        this.positionXInput.addEventListener('input', () => {
            this.positionXSlider.value = this.positionXInput.value;
            this.updatePreview();
        });
        this.positionXSlider.addEventListener('input', () => {
            this.positionXInput.value = this.positionXSlider.value;
            this.updatePreview();
        });
        
        this.positionYInput.addEventListener('input', () => {
            this.positionYSlider.value = this.positionYInput.value;
            this.updatePreview();
        });
        this.positionYSlider.addEventListener('input', () => {
            this.positionYInput.value = this.positionYSlider.value;
            this.updatePreview();
        });

        // Background color change
        document.getElementById('bgColorPicker').addEventListener('input', () => this.updatePreview());

        // Download Buttons
        this.downloadPngTransparentBtn.addEventListener('click', () => this.download('png', true));
        this.downloadPngBgColorBtn.addEventListener('click', () => this.download('png', false));
        this.downloadJpegBtn.addEventListener('click', () => this.download('jpeg', false));
    }

    _handleBaseFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        this.baseFileName = file.name.split('.').slice(0, -1).join('.') || 'image';
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.baseImage = img;
                this.baseLayerManager.setDimensions(img.naturalWidth, img.naturalHeight);
                this._enableControls(true);
                
                // If overlay exists, update its base layer reference
                if (this.overlayImage) {
                    this.overlayLayerManager.updateBaseLayerSize(img.naturalWidth, img.naturalHeight);
                } else {
                    // Update overlay manager's base size even if no overlay image yet
                    this.overlayLayerManager.updateBaseLayerSize(img.naturalWidth, img.naturalHeight);
                }
                
                this.updatePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    _handleOverlayFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.overlayImage = img;
                const baseDim = this.baseLayerManager.getDimensions();
                this.overlayLayerManager.updateBaseLayerSize(baseDim.width, baseDim.height);
                this.overlayLayerManager.setOriginalImageSize(img.naturalWidth, img.naturalHeight);
                
                // Center overlay by default
                const overlayDim = this.overlayLayerManager.getDimensions();
                const x = Math.round((baseDim.width - overlayDim.width) / 2);
                const y = Math.round((baseDim.height - overlayDim.height) / 2);
                
                this.positionXInput.value = x;
                this.positionXSlider.value = x;
                this.positionYInput.value = y;
                this.positionYSlider.value = y;
                
                // Adjust slider ranges to fit current base and overlay size
                this.positionXSlider.min = -overlayDim.width;
                this.positionXSlider.max = baseDim.width;
                this.positionYSlider.min = -overlayDim.height;
                this.positionYSlider.max = baseDim.height;
                
                this._enableOverlayControls(true);
                this.updatePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    _enableControls(enabled) {
        this.baseLayerManager.disable(!enabled);
        this.overlayImageUpload.disabled = !enabled;
        this.downloadPngTransparentBtn.disabled = !enabled;
        this.downloadPngBgColorBtn.disabled = !enabled;
        this.downloadJpegBtn.disabled = !enabled;
        this.colorManager.disable(!enabled);
    }

    _enableOverlayControls(enabled) {
        this.opacitySlider.disabled = !enabled;
        this.positionXInput.disabled = !enabled;
        this.positionXSlider.disabled = !enabled;
        this.positionYInput.disabled = !enabled;
        this.positionYSlider.disabled = !enabled;
        this.overlayLayerManager.disable(!enabled);
    }

    updatePreview() {
        if (!this.baseImage) return;

        const baseDim = this.baseLayerManager.getDimensions();
        this.previewCanvas.width = baseDim.width;
        this.previewCanvas.height = baseDim.height;

        // Draw Checkerboard for transparency
        this._drawCheckerboard(baseDim.width, baseDim.height);

        // Draw Base Image (scaled to base layer dimensions)
        this.previewCtx.drawImage(this.baseImage, 0, 0, baseDim.width, baseDim.height);

        // Draw Overlay Image
        if (this.overlayImage) {
            const overlayDim = this.overlayLayerManager.getDimensions();
            const x = parseInt(this.positionXInput.value) || 0;
            const y = parseInt(this.positionYInput.value) || 0;
            const opacity = parseInt(this.opacitySlider.value) / 100;

            this.previewCtx.save();
            this.previewCtx.globalAlpha = opacity;
            this.previewCtx.drawImage(this.overlayImage, x, y, overlayDim.width, overlayDim.height);
            this.previewCtx.restore();
        }
    }

    _drawCheckerboard(width, height) {
        const cellSize = 20;
        for (let y = 0; y < height; y += cellSize) {
            for (let x = 0; x < width; x += cellSize) {
                this.previewCtx.fillStyle = ((x / cellSize + y / cellSize) % 2 === 0) ? '#ffffff' : '#e0e0e0';
                this.previewCtx.fillRect(x, y, cellSize, cellSize);
            }
        }
    }

    download(format, transparent) {
        if (!this.baseImage) return;

        const baseDim = this.baseLayerManager.getDimensions();
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = baseDim.width;
        exportCanvas.height = baseDim.height;
        const ctx = exportCanvas.getContext('2d');

        if (!transparent) {
            ctx.fillStyle = this.colorManager.getRgbColor();
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }

        ctx.drawImage(this.baseImage, 0, 0, baseDim.width, baseDim.height);

        if (this.overlayImage) {
            const overlayDim = this.overlayLayerManager.getDimensions();
            const x = parseInt(this.positionXInput.value) || 0;
            const y = parseInt(this.positionYInput.value) || 0;
            const opacity = parseInt(this.opacitySlider.value) / 100;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.drawImage(this.overlayImage, x, y, overlayDim.width, overlayDim.height);
            ctx.restore();
        }

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const quality = format === 'jpeg' ? 0.9 : 1.0;
        const dataUrl = exportCanvas.toDataURL(mimeType, quality);
        
        const link = document.createElement('a');
        link.download = `${this.baseFileName}_merged.${format}`;
        link.href = dataUrl;
        link.click();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageMergeApp();
});
