// --- START OF FILE image_rounder.js ---
class ImageRounderApp {
    constructor() {
        // Main App UI
        this.imageUpload = document.getElementById('imageUpload');
        this.dropZone = document.getElementById('dropZone');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas ? this.previewCanvas.getContext('2d') : null;
        this.borderRadiusSlider = document.getElementById('borderRadiusSlider');
        this.radiusValueDisplay = document.getElementById('radiusValueDisplay');

        // Download UI
        this.downloadSvgBtn = document.getElementById('downloadSvgBtn');
        this.downloadPngTransparentBtn = document.getElementById('downloadPngTransparentBtn');
        this.downloadPngBgColorBtn = document.getElementById('downloadPngBgColorBtn');
        this.downloadJpegBtn = document.getElementById('downloadJpegBtn');

        // --- Managers ---
        this.colorManager = new ColorManager(
            document.getElementById('bgColorPicker')
        );

        this.baseLayerManager = new BaseLayerManager(
            document.getElementById('basePresetWidth'), document.getElementById('baseCustomWidth'),
            document.getElementById('basePresetHeight'), document.getElementById('baseCustomHeight'),
            document.getElementById('baseAspectRatioLock'),
            (baseW, baseH) => this.handleBaseLayerUpdate(baseW, baseH) // Callback
        );

        this.imageLayerManager = new ImageLayerManager(
            document.getElementById('imageLayerScalePercentage'), document.getElementById('imageLayerScaleDisplay'),
            document.getElementById('imageLayerResizeWidth'), document.getElementById('imageLayerResizeHeight'),
            document.getElementById('imageLayerAspectRatioLock'),
            (imgW, imgH) => this.handleImageLayerUpdate(imgW, imgH) // Callback
        );

        // State
        this.originalImage = null;
        this.originalImageDataBase64 = null;
        this.originalFileName = 'rounded_image';

        this._init();
    }

    _init() {
        this._setupEventListeners();
        this.resetApp();
    }

    _setupEventListeners() {
        if (this.imageUpload) {
            this.imageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) this.handleFile(file);
                else if (!this.originalImage) this.resetApp();
            });
        }
        if (this.dropZone) {
            this.dropZone.addEventListener('dragover', (event) => { event.preventDefault(); this.dropZone.classList.add('dragover'); });
            this.dropZone.addEventListener('dragleave', (event) => { event.preventDefault(); this.dropZone.classList.remove('dragover'); });
            this.dropZone.addEventListener('drop', (event) => {
                event.preventDefault();
                this.dropZone.classList.remove('dragover');
                const file = event.dataTransfer.files[0];
                if (file) {
                    this.handleFile(file);
                    if (this.imageUpload) this.imageUpload.value = '';
                }
            });
        }
        if (this.borderRadiusSlider) {
            this.borderRadiusSlider.addEventListener('input', () => {
                if (this.radiusValueDisplay) this.radiusValueDisplay.textContent = this.borderRadiusSlider.value;
                this.updatePreview();
            });
        }
        // Download Listeners
        if (this.downloadSvgBtn) this.downloadSvgBtn.addEventListener('click', () => this._downloadSvg());
        if (this.downloadPngTransparentBtn) this.downloadPngTransparentBtn.addEventListener('click', () => this._downloadPngTransparent());
        if (this.downloadPngBgColorBtn) this.downloadPngBgColorBtn.addEventListener('click', () => this._downloadPngWithBackground());
        if (this.downloadJpegBtn) this.downloadJpegBtn.addEventListener('click', () => this._downloadJpeg());
    }

    handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert("画像ファイルを選択してください。");
            if (!this.originalImage) this.resetApp();
            return;
        }
        this.originalFileName = file.name.split('.').slice(0, -1).join('.') || 'downloaded_image';
        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImageDataBase64 = e.target.result;
            this.originalImage = new Image();
            this.originalImage.onload = () => {
                if (this.originalImage.naturalWidth === 0 || this.originalImage.naturalHeight === 0) {
                    alert("画像の幅または高さが0です。有効な画像を選択してください。"); this.resetApp(); return;
                }
                const imgNatW = this.originalImage.naturalWidth;
                const imgNatH = this.originalImage.naturalHeight;

                // Initialize base layer to match image size
                this.baseLayerManager.setDimensions(imgNatW, imgNatH);

                // Initialize image layer manager with original image size
                // and current base layer size (for percentage calculation)
                this.imageLayerManager.setOriginalImageSize(imgNatW, imgNatH);
                this.imageLayerManager.updateBaseLayerSize(imgNatW, imgNatH); // Base size is initially same as image

                this._updateBorderRadiusSliderMax();
                this.updatePreview();
                this._enableElements(true);
            };
            this.originalImage.onerror = () => { alert("画像の読み込みに失敗しました。"); this.resetApp(); };
            this.originalImage.src = this.originalImageDataBase64;
        };
        reader.onerror = () => { alert("ファイルの読み込みに失敗しました。"); this.resetApp(); };
        reader.readAsDataURL(file);
    }

    handleBaseLayerUpdate(baseW, baseH) {
        // Base layer size changed, inform image layer manager to update its size if it's based on percentage
        this.imageLayerManager.updateBaseLayerSize(baseW, baseH);
        this._updateBorderRadiusSliderMax(); // Max radius depends on image layer
        this.updatePreview();
    }

    handleImageLayerUpdate(imgW, imgH) {
        // Image layer size changed (either by direct input or scale slider)
        this._updateBorderRadiusSliderMax();
        this.updatePreview();
    }

    _updateBorderRadiusSliderMax() {
        if (!this.imageLayerManager || !this.borderRadiusSlider) return;
        const { width: imgW, height: imgH } = this.imageLayerManager.getDimensions();
        const imgLayerShortSide = Math.min(imgW, imgH);
        const maxRadius = imgLayerShortSide > 0 ? Math.floor(imgLayerShortSide / 2) : 0;

        this.borderRadiusSlider.max = maxRadius;
        let currentRadiusValue = getSafeInt(this.borderRadiusSlider.value);

        if (maxRadius === 0) currentRadiusValue = 0;
        else if (currentRadiusValue > maxRadius) currentRadiusValue = maxRadius;

        this.borderRadiusSlider.value = currentRadiusValue;
        if (this.radiusValueDisplay) this.radiusValueDisplay.textContent = this.borderRadiusSlider.value;
    }


    _drawRoundedPath(ctx, x, y, width, height, radius) {
        if (width <= 0 || height <= 0) return;
        const r = Math.max(0, Math.min(getSafeInt(radius), width / 2, height / 2));
        ctx.beginPath();
        if (r === 0) {
            ctx.rect(x, y, width, height);
        } else {
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + width - r, y);
            ctx.arcTo(x + width, y, x + width, y + r, r);
            ctx.lineTo(x + width, y + height - r);
            ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
            ctx.lineTo(x + r, y + height);
            ctx.arcTo(x, y + height, x, y + height - r, r);
            ctx.lineTo(x, y + r);
            ctx.arcTo(x, y, x + r, y, r);
        }
        ctx.closePath();
    }

    updatePreview() {
        if (!this.originalImage || !this.previewCtx) return;
        const { width: baseW, height: baseH } = this.baseLayerManager.getDimensions();
        const { width: imgW, height: imgH } = this.imageLayerManager.getDimensions();

        this.previewCanvas.width = baseW > 0 ? baseW : 300;
        this.previewCanvas.height = baseH > 0 ? baseH : 150;
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

        if (imgW > 0 && imgH > 0) {
            const imageX = (this.previewCanvas.width - imgW) / 2;
            const imageY = (this.previewCanvas.height - imgH) / 2;
            const radius = getSafeInt(this.borderRadiusSlider.value);

            this.previewCtx.save();
            this._drawRoundedPath(this.previewCtx, imageX, imageY, imgW, imgH, radius);
            this.previewCtx.clip();
            this.previewCtx.drawImage(this.originalImage, imageX, imageY, imgW, imgH);
            this.previewCtx.restore();
        }
    }

    _downloadURI(uri, name) {
        const link = document.createElement('a');
        link.download = name;
        link.href = uri; document.body.appendChild(link); link.click(); document.body.removeChild(link);
        if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
    }
    _getCleanFileName() { return this.originalFileName; }

    _prepareDownloadCanvas(fill, fillColor = '#ffffff') {
        if (!this.originalImage) return null;
        const { width: baseW, height: baseH } = this.baseLayerManager.getDimensions();
        const { width: imgW, height: imgH } = this.imageLayerManager.getDimensions();

        if (baseW <= 0 || baseH <= 0) return null;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = baseW; tempCanvas.height = baseH;

        if (fill) { tempCtx.fillStyle = fillColor; tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); }

        if (imgW > 0 && imgH > 0) {
            const imageX = (tempCanvas.width - imgW) / 2;
            const imageY = (tempCanvas.height - imgH) / 2;
            const radius = getSafeInt(this.borderRadiusSlider.value);
            tempCtx.save();
            this._drawRoundedPath(tempCtx, imageX, imageY, imgW, imgH, radius);
            tempCtx.clip();
            tempCtx.drawImage(this.originalImage, 0, 0, this.originalImage.naturalWidth, this.originalImage.naturalHeight, imageX, imageY, imgW, imgH);
            tempCtx.restore();
        }
        return tempCanvas;
    }

    _downloadSvg() {
        if (!this.originalImage || !this.originalImageDataBase64) return;
        const { width: baseW, height: baseH } = this.baseLayerManager.getDimensions();
        const { width: imgW, height: imgH } = this.imageLayerManager.getDimensions();
        if (baseW <= 0 || baseH <= 0) return;

        const radius = getSafeInt(this.borderRadiusSlider.value);
        const imageX = (baseW - imgW) / 2; const imageY = (baseH - imgH) / 2;
        const effectiveRadius = Math.max(0, Math.min(radius, imgW / 2, imgH / 2));
        const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${baseW}" height="${baseH}" viewBox="0 0 ${baseW} ${baseH}"><defs><clipPath id="rounded-corners-clip"><rect x="${imageX}" y="${imageY}" width="${imgW}" height="${imgH}" rx="${effectiveRadius}" ry="${effectiveRadius}"/></clipPath></defs>${(imgW > 0 && imgH > 0) ? `<image href="${this.originalImageDataBase64}" x="${imageX}" y="${imageY}" width="${imgW}" height="${imgH}" clip-path="url(#rounded-corners-clip)"/>` : ''}</svg>`;
        const blob = new Blob([svgContent.trim()], {type: 'image/svg+xml;charset=utf-8'});
        this._downloadURI(URL.createObjectURL(blob), `${this._getCleanFileName()}_b${baseW}x${baseH}_i${imgW}x${imgH}_rounded.svg`);
    }
    _downloadJpeg() {
        if (!this.originalImage) return;
        const bgColor = this.colorManager.getRgbColor();
        const canvas = this._prepareDownloadCanvas(true, bgColor);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const { width: baseW, height: baseH } = this.baseLayerManager.getDimensions();
            const { width: imgW, height: imgH } = this.imageLayerManager.getDimensions();
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_b${baseW}x${baseH}_i${imgW}x${imgH}_rounded_bg_${bgColor.replace('#','')}.jpg`);
        }
    }
    _downloadPngTransparent() {
        if (!this.originalImage) return;
        const canvas = this._prepareDownloadCanvas(false);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const { width: baseW, height: baseH } = this.baseLayerManager.getDimensions();
            const { width: imgW, height: imgH } = this.imageLayerManager.getDimensions();
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_b${baseW}x${baseH}_i${imgW}x${imgH}_rounded_transparent.png`);
        }
    }
    _downloadPngWithBackground() {
        if (!this.originalImage) return;
        const bgColor = this.colorManager.getRgbColor();
        const canvas = this._prepareDownloadCanvas(true, bgColor);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const { width: baseW, height: baseH } = this.baseLayerManager.getDimensions();
            const { width: imgW, height: imgH } = this.imageLayerManager.getDimensions();
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_b${baseW}x${baseH}_i${imgW}x${imgH}_rounded_bg_${bgColor.replace('#','')}.png`);
        }
    }

    _enableElements(enabled) {
        if(this.borderRadiusSlider) this.borderRadiusSlider.disabled = !enabled;
        if(this.downloadSvgBtn) this.downloadSvgBtn.disabled = !enabled;
        if(this.downloadPngTransparentBtn) this.downloadPngTransparentBtn.disabled = !enabled;
        if(this.downloadPngBgColorBtn) this.downloadPngBgColorBtn.disabled = !enabled;
        if(this.downloadJpegBtn) this.downloadJpegBtn.disabled = !enabled;

        this.colorManager.disable(!enabled);
        this.baseLayerManager.disable(!enabled);
        this.imageLayerManager.disable(!enabled);
    }

    resetApp() {
        if(this.previewCtx) { this.previewCtx.clearRect(0,0,this.previewCanvas.width,this.previewCanvas.height); this.previewCanvas.width=300; this.previewCanvas.height=150; }
        this.originalImage = null; this.originalImageDataBase64 = null; this.originalFileName = 'rounded_image';

        if(this.borderRadiusSlider) { this.borderRadiusSlider.value = 20; this.borderRadiusSlider.max = 100;}
        if(this.radiusValueDisplay) this.radiusValueDisplay.textContent = '20';

        this.colorManager.reset();
        this.baseLayerManager.reset(); // Resets to empty/default, not based on image
        this.imageLayerManager.reset(); // Resets to empty/default

        if(this.imageUpload) this.imageUpload.value = '';
        if(this.dropZone) this.dropZone.classList.remove('dragover');
        this._enableElements(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageRounderApp();
});
// --- END OF FILE image_rounder.js ---
