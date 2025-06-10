// --- START OF FILE color_converter.js ---
class ColorConverterApp {
    constructor() {
        // Main App UI
        this.imageUpload = document.getElementById('imageUpload');
        this.dropZone = document.getElementById('dropZone');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas ? this.previewCanvas.getContext('2d') : null;
        this.toleranceSlider = document.getElementById('toleranceSlider');
        this.toleranceValueDisplay = document.getElementById('toleranceValueDisplay');
        this.pickFromImageBtn = document.getElementById('pickFromImageBtn');
        this.applyConversionBtn = document.getElementById('applyConversionBtn');
        this.resetImageBtn = document.getElementById('resetImageBtn');

        // Download UI
        this.downloadPngTransparentBtn = document.getElementById('downloadPngTransparentBtn');
        this.downloadPngBgColorBtn = document.getElementById('downloadPngBgColorBtn');
        this.downloadJpegBtn = document.getElementById('downloadJpegBtn');

        // --- Managers ---
        this.colorManager = new ColorManager(
            document.getElementById('sourceColorPicker'),
            document.getElementById('targetColorPicker'),
            document.getElementById('bgColorPicker')
        );

        // State
        this.originalImage = null;
        this.originalImageDataBase64 = null;
        this.originalFileName = 'converted_image';
        this.convertedImage = null;
        this.imageData = null;

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
        if (this.toleranceSlider) {
            this.toleranceSlider.addEventListener('input', () => {
                if (this.toleranceValueDisplay) this.toleranceValueDisplay.textContent = this.toleranceSlider.value;
            });
        }
        if (this.pickFromImageBtn) {
            this.pickFromImageBtn.addEventListener('click', () => {
                this.togglePickFromImage();
            });
        }
        if (this.previewCanvas) {
            this.previewCanvas.addEventListener('click', (event) => {
                if (this.colorManager.isPickingFromImage()) {
                    this.pickColorFromCanvas(event);
                }
            });
        }
        if (this.applyConversionBtn) {
            this.applyConversionBtn.addEventListener('click', () => {
                this.applyColorConversion();
            });
        }
        if (this.resetImageBtn) {
            this.resetImageBtn.addEventListener('click', () => {
                this.resetToOriginalImage();
            });
        }
        // Download Listeners
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
        this.originalFileName = file.name.split('.').slice(0, -1).join('.') || 'converted_image';
        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImageDataBase64 = e.target.result;
            this.originalImage = new Image();
            this.originalImage.onload = () => {
                if (this.originalImage.naturalWidth === 0 || this.originalImage.naturalHeight === 0) {
                    alert("画像の幅または高さが0です。有効な画像を選択してください。"); this.resetApp(); return;
                }
                this.updatePreview();
                this._enableElements(true);
            };
            this.originalImage.onerror = () => { alert("画像の読み込みに失敗しました。"); this.resetApp(); };
            this.originalImage.src = this.originalImageDataBase64;
        };
        reader.onerror = () => { alert("ファイルの読み込みに失敗しました。"); this.resetApp(); };
        reader.readAsDataURL(file);
    }

    togglePickFromImage() {
        const isPicking = !this.colorManager.isPickingFromImage();
        this.colorManager.setPickingFromImage(isPicking);
        
        if (this.pickFromImageBtn) {
            this.pickFromImageBtn.textContent = isPicking ? '選択をキャンセル' : '画像から色を選択';
            this.pickFromImageBtn.style.backgroundColor = isPicking ? '#dc3545' : '#007bff';
        }
        
        if (this.previewCanvas) {
            this.previewCanvas.style.cursor = isPicking ? 'crosshair' : 'default';
        }
    }

    pickColorFromCanvas(event) {
        if (!this.previewCtx || !this.originalImage) return;
        
        const rect = this.previewCanvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) * (this.previewCanvas.width / rect.width));
        const y = Math.floor((event.clientY - rect.top) * (this.previewCanvas.height / rect.height));
        
        const pixelData = this.previewCtx.getImageData(x, y, 1, 1).data;
        const hexColor = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        
        this.colorManager.setSourceColor(hexColor);
        this.togglePickFromImage(); // Turn off picking mode
    }

    applyColorConversion() {
        if (!this.originalImage || !this.previewCtx) return;
        
        const sourceColor = hexToRgb(this.colorManager.getSourceColor());
        const targetColor = hexToRgb(this.colorManager.getTargetColor());
        const tolerance = getSafeInt(this.toleranceSlider.value, 10);
        
        // Create a temporary canvas to process the image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.originalImage.naturalWidth;
        tempCanvas.height = this.originalImage.naturalHeight;
        
        // Draw the original image to the temporary canvas
        tempCtx.drawImage(this.originalImage, 0, 0);
        
        // Get the image data
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // Calculate the maximum distance based on tolerance (0-100)
        // Max possible distance in RGB space is sqrt(255^2 + 255^2 + 255^2) = 441.67
        const maxDistance = 441.67 * (tolerance / 100);
        
        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            const pixelColor = { r: data[i], g: data[i + 1], b: data[i + 2] };
            const distance = colorDistance(pixelColor, sourceColor);
            
            if (distance <= maxDistance) {
                // Replace the color
                data[i] = targetColor.r;
                data[i + 1] = targetColor.g;
                data[i + 2] = targetColor.b;
                // Alpha channel (data[i + 3]) remains unchanged
            }
        }
        
        // Put the processed image data back
        tempCtx.putImageData(imageData, 0, 0);
        
        // Create a new image from the processed canvas
        this.convertedImage = new Image();
        this.convertedImage.onload = () => {
            this.updatePreview(true);
        };
        this.convertedImage.src = tempCanvas.toDataURL('image/png');
    }

    resetToOriginalImage() {
        this.convertedImage = null;
        this.updatePreview();
    }

    updatePreview(useConverted = false) {
        if (!this.originalImage || !this.previewCtx) return;
        
        const imageToUse = useConverted && this.convertedImage ? this.convertedImage : this.originalImage;
        
        // Resize canvas to match image dimensions
        this.previewCanvas.width = imageToUse.naturalWidth;
        this.previewCanvas.height = imageToUse.naturalHeight;
        
        // Clear canvas
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        // Draw image
        this.previewCtx.drawImage(imageToUse, 0, 0);
    }

    _downloadURI(uri, name) {
        const link = document.createElement('a');
        link.download = name;
        link.href = uri; document.body.appendChild(link); link.click(); document.body.removeChild(link);
        if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
    }
    
    _getCleanFileName() { return this.originalFileName; }

    _prepareDownloadCanvas(fill, fillColor = '#ffffff') {
        const imageToUse = this.convertedImage || this.originalImage;
        if (!imageToUse) return null;
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageToUse.naturalWidth;
        tempCanvas.height = imageToUse.naturalHeight;
        
        if (fill) { 
            tempCtx.fillStyle = fillColor; 
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height); 
        }
        
        tempCtx.drawImage(imageToUse, 0, 0);
        return tempCanvas;
    }

    _downloadPngTransparent() {
        const canvas = this._prepareDownloadCanvas(false);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_converted_transparent.png`);
        }
    }
    
    _downloadPngWithBackground() {
        const bgColor = this.colorManager.getBgColor();
        const canvas = this._prepareDownloadCanvas(true, bgColor);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_converted_bg_${bgColor.replace('#','')}.png`);
        }
    }
    
    _downloadJpeg() {
        const bgColor = this.colorManager.getBgColor();
        const canvas = this._prepareDownloadCanvas(true, bgColor);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_converted_bg_${bgColor.replace('#','')}.jpg`);
        }
    }

    _enableElements(enabled) {
        if(this.toleranceSlider) this.toleranceSlider.disabled = !enabled;
        if(this.pickFromImageBtn) this.pickFromImageBtn.disabled = !enabled;
        if(this.applyConversionBtn) this.applyConversionBtn.disabled = !enabled;
        if(this.resetImageBtn) this.resetImageBtn.disabled = !enabled;
        if(this.downloadPngTransparentBtn) this.downloadPngTransparentBtn.disabled = !enabled;
        if(this.downloadPngBgColorBtn) this.downloadPngBgColorBtn.disabled = !enabled;
        if(this.downloadJpegBtn) this.downloadJpegBtn.disabled = !enabled;

        this.colorManager.disable(!enabled);
    }

    resetApp() {
        if(this.previewCtx) { 
            this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height); 
            this.previewCanvas.width = 300; 
            this.previewCanvas.height = 150; 
        }
        this.originalImage = null; 
        this.originalImageDataBase64 = null; 
        this.originalFileName = 'converted_image';
        this.convertedImage = null;

        if(this.toleranceSlider) { 
            this.toleranceSlider.value = 10; 
        }
        if(this.toleranceValueDisplay) this.toleranceValueDisplay.textContent = '10';

        this.colorManager.reset();

        if(this.imageUpload) this.imageUpload.value = '';
        if(this.dropZone) this.dropZone.classList.remove('dragover');
        if(this.pickFromImageBtn) {
            this.pickFromImageBtn.textContent = '画像から色を選択';
            this.pickFromImageBtn.style.backgroundColor = '#007bff';
        }
        if(this.previewCanvas) {
            this.previewCanvas.style.cursor = 'default';
        }
        
        this._enableElements(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ColorConverterApp();
});
// --- END OF FILE color_converter.js ---