// --- START OF FILE image_merge.js ---
class ImageMergeApp {
    constructor() {
        // Main App UI
        this.baseImageUpload = document.getElementById('baseImageUpload');
        this.overlayImageUpload = document.getElementById('overlayImageUpload');
        this.dropZone = document.getElementById('dropZone');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas ? this.previewCanvas.getContext('2d') : null;
        
        // Download UI
        this.downloadPngTransparentBtn = document.getElementById('downloadPngTransparentBtn');
        this.downloadPngBgColorBtn = document.getElementById('downloadPngBgColorBtn');
        this.downloadJpegBtn = document.getElementById('downloadJpegBtn');
        
        // --- Managers ---
        this.colorManager = new ColorManager(
            document.getElementById('bgColorPicker')
        );
        
        this.baseImageManager = new BaseImageManager(
            (baseW, baseH) => this.handleBaseImageUpdate(baseW, baseH) // Callback
        );
        
        this.overlayImageManager = new OverlayImageManager(
            document.getElementById('overlayScalePercentage'),
            document.getElementById('overlayScaleDisplay'),
            document.getElementById('overlayWidth'),
            document.getElementById('overlayHeight'),
            document.getElementById('overlayAspectRatioLock'),
            document.getElementById('positionX'),
            document.getElementById('positionY'),
            document.getElementById('opacitySlider'),
            document.getElementById('opacityValueDisplay'),
            () => this.updatePreview() // Callback
        );
        
        this._init();
    }
    
    _init() {
        this._setupEventListeners();
        this.resetApp();
    }
    
    _setupEventListeners() {
        // Base image upload
        if (this.baseImageUpload) {
            this.baseImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) this.handleBaseImageFile(file);
            });
        }
        
        // Overlay image upload
        if (this.overlayImageUpload) {
            this.overlayImageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) this.handleOverlayImageFile(file);
            });
        }
        
        // Drag and drop for both images
        if (this.dropZone) {
            this.dropZone.addEventListener('dragover', (event) => { 
                event.preventDefault(); 
                this.dropZone.classList.add('dragover'); 
            });
            
            this.dropZone.addEventListener('dragleave', (event) => { 
                event.preventDefault(); 
                this.dropZone.classList.remove('dragover'); 
            });
            
            this.dropZone.addEventListener('drop', (event) => {
                event.preventDefault();
                this.dropZone.classList.remove('dragover');
                const files = event.dataTransfer.files;
                
                if (files.length > 0) {
                    // If we don't have a base image yet, use the first file as the base image
                    if (!this.baseImageManager.getImage()) {
                        this.handleBaseImageFile(files[0]);
                        
                        // If there's a second file, use it as the overlay image
                        if (files.length > 1) {
                            this.handleOverlayImageFile(files[1]);
                        }
                    } 
                    // If we already have a base image but no overlay image, use the first file as the overlay image
                    else if (!this.overlayImageManager.getImage()) {
                        this.handleOverlayImageFile(files[0]);
                    }
                    // If we already have both images, replace the overlay image
                    else {
                        this.handleOverlayImageFile(files[0]);
                    }
                }
            });
        }
        
        // Download buttons
        if (this.downloadPngTransparentBtn) {
            this.downloadPngTransparentBtn.addEventListener('click', () => this._downloadPngTransparent());
        }
        
        if (this.downloadPngBgColorBtn) {
            this.downloadPngBgColorBtn.addEventListener('click', () => this._downloadPngWithBackground());
        }
        
        if (this.downloadJpegBtn) {
            this.downloadJpegBtn.addEventListener('click', () => this._downloadJpeg());
        }
    }
    
    handleBaseImageFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert("画像ファイルを選択してください。");
            return;
        }
        
        const fileName = file.name.split('.').slice(0, -1).join('.') || 'merged_image';
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageDataBase64 = e.target.result;
            const image = new Image();
            
            image.onload = () => {
                if (image.naturalWidth === 0 || image.naturalHeight === 0) {
                    alert("画像の幅または高さが0です。有効な画像を選択してください。");
                    return;
                }
                
                this.baseImageManager.setImage(image, imageDataBase64, fileName);
                this._enableElements();
                this.updatePreview();
            };
            
            image.onerror = () => {
                alert("画像の読み込みに失敗しました。");
            };
            
            image.src = imageDataBase64;
        };
        
        reader.onerror = () => {
            alert("ファイルの読み込みに失敗しました。");
        };
        
        reader.readAsDataURL(file);
    }
    
    handleOverlayImageFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert("画像ファイルを選択してください。");
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const imageDataBase64 = e.target.result;
            const image = new Image();
            
            image.onload = () => {
                if (image.naturalWidth === 0 || image.naturalHeight === 0) {
                    alert("画像の幅または高さが0です。有効な画像を選択してください。");
                    return;
                }
                
                this.overlayImageManager.setImage(image, imageDataBase64);
                this._enableElements();
                this.updatePreview();
            };
            
            image.onerror = () => {
                alert("画像の読み込みに失敗しました。");
            };
            
            image.src = imageDataBase64;
        };
        
        reader.onerror = () => {
            alert("ファイルの読み込みに失敗しました。");
        };
        
        reader.readAsDataURL(file);
    }
    
    handleBaseImageUpdate(baseW, baseH) {
        // Base image size changed, inform overlay image manager
        this.overlayImageManager.updateBaseLayerSize(baseW, baseH);
        this.updatePreview();
    }
    
    updatePreview() {
        if (!this.previewCtx) return;
        
        const baseImage = this.baseImageManager.getImage();
        if (!baseImage) {
            // Clear canvas and return if no base image
            this.previewCanvas.width = 300;
            this.previewCanvas.height = 150;
            this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
            return;
        }
        
        const { width: baseW, height: baseH } = this.baseImageManager.getDimensions();
        
        // Set canvas size to match base image
        this.previewCanvas.width = baseW;
        this.previewCanvas.height = baseH;
        
        // Clear canvas
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
        
        // Draw base image
        this.previewCtx.drawImage(baseImage, 0, 0, baseW, baseH);
        
        // Draw overlay image if available
        const overlayImage = this.overlayImageManager.getImage();
        if (overlayImage) {
            const { width: overlayW, height: overlayH } = this.overlayImageManager.getDimensions();
            const { x: posX, y: posY } = this.overlayImageManager.getPosition();
            const opacity = this.overlayImageManager.getOpacity();
            
            // Save context state
            this.previewCtx.save();
            
            // Set global alpha for transparency
            this.previewCtx.globalAlpha = opacity;
            
            // Draw overlay image
            this.previewCtx.drawImage(overlayImage, posX, posY, overlayW, overlayH);
            
            // Restore context state
            this.previewCtx.restore();
        }
    }
    
    _downloadURI(uri, name) {
        const link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (uri.startsWith('blob:')) {
            URL.revokeObjectURL(uri);
        }
    }
    
    _getCleanFileName() {
        return this.baseImageManager.getFileName();
    }
    
    _prepareDownloadCanvas(fill, fillColor = '#ffffff') {
        const baseImage = this.baseImageManager.getImage();
        if (!baseImage) return null;
        
        const { width: baseW, height: baseH } = this.baseImageManager.getDimensions();
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = baseW;
        tempCanvas.height = baseH;
        
        if (fill) {
            tempCtx.fillStyle = fillColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // Draw base image
        tempCtx.drawImage(baseImage, 0, 0, baseW, baseH);
        
        // Draw overlay image if available
        const overlayImage = this.overlayImageManager.getImage();
        if (overlayImage) {
            const { width: overlayW, height: overlayH } = this.overlayImageManager.getDimensions();
            const { x: posX, y: posY } = this.overlayImageManager.getPosition();
            const opacity = this.overlayImageManager.getOpacity();
            
            // Save context state
            tempCtx.save();
            
            // Set global alpha for transparency
            tempCtx.globalAlpha = opacity;
            
            // Draw overlay image
            tempCtx.drawImage(overlayImage, posX, posY, overlayW, overlayH);
            
            // Restore context state
            tempCtx.restore();
        }
        
        return tempCanvas;
    }
    
    _downloadPngTransparent() {
        const canvas = this._prepareDownloadCanvas(false);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_merged.png`);
        }
    }
    
    _downloadPngWithBackground() {
        const bgColor = this.colorManager.getRgbColor();
        const canvas = this._prepareDownloadCanvas(true, bgColor);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_merged_bg_${bgColor.replace('#', '')}.png`);
        }
    }
    
    _downloadJpeg() {
        const bgColor = this.colorManager.getRgbColor();
        const canvas = this._prepareDownloadCanvas(true, bgColor);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_merged_bg_${bgColor.replace('#', '')}.jpg`);
        }
    }
    
    _enableElements(enabled = true) {
        const hasBaseImage = !!this.baseImageManager.getImage();
        const hasOverlayImage = !!this.overlayImageManager.getImage();
        
        // Enable download buttons only if we have at least a base image
        if (this.downloadPngTransparentBtn) this.downloadPngTransparentBtn.disabled = !hasBaseImage;
        if (this.downloadPngBgColorBtn) this.downloadPngBgColorBtn.disabled = !hasBaseImage;
        if (this.downloadJpegBtn) this.downloadJpegBtn.disabled = !hasBaseImage;
        
        // Enable color picker if we have a base image
        this.colorManager.disable(!hasBaseImage);
        
        // Enable overlay controls only if we have both images
        this.overlayImageManager.disable(!hasOverlayImage);
    }
    
    resetApp() {
        if (this.previewCtx) {
            this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
            this.previewCanvas.width = 300;
            this.previewCanvas.height = 150;
        }
        
        this.baseImageManager.reset();
        this.overlayImageManager.reset();
        this.colorManager.reset();
        
        if (this.baseImageUpload) this.baseImageUpload.value = '';
        if (this.overlayImageUpload) this.overlayImageUpload.value = '';
        if (this.dropZone) this.dropZone.classList.remove('dragover');
        
        this._enableElements(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageMergeApp();
});
// --- END OF FILE image_merge.js ---