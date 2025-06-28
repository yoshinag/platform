// --- START OF FILE image_trim.js ---
class ImageTrimApp {
    constructor() {
        // Main App UI
        this.imageUpload = document.getElementById('imageUpload');
        this.dropZone = document.getElementById('dropZone');
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas ? this.previewCanvas.getContext('2d') : null;

        // Control UI
        this.thresholdSlider = document.getElementById('thresholdSlider');
        this.thresholdValueDisplay = document.getElementById('thresholdValueDisplay');
        this.edgeWidthSlider = document.getElementById('edgeWidthSlider');
        this.edgeWidthValueDisplay = document.getElementById('edgeWidthValueDisplay');
        this.outerContourOnlyCheckbox = document.getElementById('outerContourOnlyCheckbox');
        this.fillContourCheckbox = document.getElementById('fillContourCheckbox');
        this.applyContourBtn = document.getElementById('applyContourBtn');
        this.resetImageBtn = document.getElementById('resetImageBtn');

        // Download UI
        this.downloadPngTransparentBtn = document.getElementById('downloadPngTransparentBtn');
        this.downloadPngBgColorBtn = document.getElementById('downloadPngBgColorBtn');
        this.downloadJpegBtn = document.getElementById('downloadJpegBtn');

        // Color Manager
        this.colorManager = new ColorManager(
            document.getElementById('bgColorPicker'),
            document.getElementById('edgeColorPicker'),
            document.getElementById('fillColorPicker')
        );

        // State
        this.originalImage = null;
        this.originalImageDataBase64 = null;
        this.originalFileName = 'contour_image';
        this.processedImageData = null;
        this.isProcessing = false;

        this._init();
    }

    _init() {
        this._setupEventListeners();
        this.resetApp();
    }

    _setupEventListeners() {
        // File upload listeners
        if (this.imageUpload) {
            this.imageUpload.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) this.handleFile(file);
                else if (!this.originalImage) this.resetApp();
            });
        }

        // Drag and drop listeners
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
                const file = event.dataTransfer.files[0];
                if (file) {
                    this.handleFile(file);
                    if (this.imageUpload) this.imageUpload.value = '';
                }
            });
        }

        // Control listeners
        if (this.thresholdSlider) {
            this.thresholdSlider.addEventListener('input', () => {
                if (this.thresholdValueDisplay) {
                    this.thresholdValueDisplay.textContent = this.thresholdSlider.value;
                }
            });
        }

        if (this.edgeWidthSlider) {
            this.edgeWidthSlider.addEventListener('input', () => {
                if (this.edgeWidthValueDisplay) {
                    this.edgeWidthValueDisplay.textContent = this.edgeWidthSlider.value;
                }
            });
        }

        if (this.applyContourBtn) {
            this.applyContourBtn.addEventListener('click', () => this.applyContourExtraction());
        }

        if (this.resetImageBtn) {
            this.resetImageBtn.addEventListener('click', () => this.resetToOriginalImage());
        }

        // Download listeners
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

    handleFile(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert("画像ファイルを選択してください。");
            if (!this.originalImage) this.resetApp();
            return;
        }

        this.originalFileName = file.name.split('.').slice(0, -1).join('.') || 'contour_image';
        const reader = new FileReader();

        reader.onload = (e) => {
            this.originalImageDataBase64 = e.target.result;
            this.originalImage = new Image();
            this.originalImage.onload = () => {
                if (this.originalImage.naturalWidth === 0 || this.originalImage.naturalHeight === 0) {
                    alert("画像の幅または高さが0です。有効な画像を選択してください。");
                    this.resetApp();
                    return;
                }

                this.updatePreview();
                this._enableElements(true);
            };
            this.originalImage.onerror = () => {
                alert("画像の読み込みに失敗しました。");
                this.resetApp();
            };
            this.originalImage.src = this.originalImageDataBase64;
        };

        reader.onerror = () => {
            alert("ファイルの読み込みに失敗しました。");
            this.resetApp();
        };

        reader.readAsDataURL(file);
    }

    updatePreview() {
        if (!this.originalImage || !this.previewCtx) return;

        const imgWidth = this.originalImage.naturalWidth;
        const imgHeight = this.originalImage.naturalHeight;

        // Resize canvas to match image dimensions
        this.previewCanvas.width = imgWidth;
        this.previewCanvas.height = imgHeight;

        // Clear canvas
        this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

        // Draw original or processed image
        if (this.processedImageData) {
            this.previewCtx.putImageData(this.processedImageData, 0, 0);
        } else {
            this.previewCtx.drawImage(this.originalImage, 0, 0);
        }
    }

    applyContourExtraction() {
        if (!this.originalImage || this.isProcessing) return;
        this.isProcessing = true;

        // Disable UI during processing
        this._enableElements(false);
        this.applyContourBtn.textContent = "処理中...";

        // Use setTimeout to allow UI to update before heavy processing
        setTimeout(() => {
            try {
                // Create a temporary canvas to process the image
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = this.originalImage.naturalWidth;
                tempCanvas.height = this.originalImage.naturalHeight;

                // Draw the original image to the temp canvas
                tempCtx.drawImage(this.originalImage, 0, 0);

                // Get image data for processing
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

                // Get parameters from UI
                const threshold = getSafeInt(this.thresholdSlider.value, 100);
                const edgeWidth = getSafePositiveInt(this.edgeWidthSlider.value, 1);
                const outerContourOnly = this.outerContourOnlyCheckbox.checked;
                const fillContours = this.fillContourCheckbox.checked;

                // Apply Sobel operator for edge detection
                let processedData = applySobelOperator(
                    imageData, 
                    tempCanvas.width, 
                    tempCanvas.height, 
                    threshold
                );

                // Extract only the outer contour if requested
                if (outerContourOnly) {
                    processedData = extractOuterContour(
                        processedData,
                        tempCanvas.width,
                        tempCanvas.height
                    );
                }

                // Apply edge dilation if needed
                if (edgeWidth > 1) {
                    processedData = dilateEdges(
                        processedData, 
                        tempCanvas.width, 
                        tempCanvas.height, 
                        edgeWidth
                    );
                }

                // Apply edge coloring and filling
                this._colorizeEdges(
                    processedData, 
                    tempCanvas.width, 
                    tempCanvas.height, 
                    fillContours
                );

                // Store the processed image data
                this.processedImageData = processedData;

                // Update the preview
                this.updatePreview();
            } catch (error) {
                console.error("Error processing image:", error);
                alert("画像の処理中にエラーが発生しました。");
            } finally {
                // Re-enable UI
                this._enableElements(true);
                this.applyContourBtn.textContent = "輪郭抽出を適用";
                this.isProcessing = false;
            }
        }, 50); // Small delay to allow UI update
    }

    _colorizeEdges(imageData, width, height, fillContours) {
        const data = imageData.data;
        const edgeColor = this.colorManager.hexToRgb(this.colorManager.getEdgeColor());
        const fillColor = this.colorManager.hexToRgb(this.colorManager.getFillColor());

        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) { // If pixel is part of an edge
                // Set edge color
                data[i] = edgeColor.r;
                data[i + 1] = edgeColor.g;
                data[i + 2] = edgeColor.b;
            } else if (fillContours) {
                // For fill, we would need more complex logic to determine inside/outside
                // This is a simplified approach that doesn't actually fill contours
                // A proper fill would require flood fill or similar algorithms
                data[i] = fillColor.r;
                data[i + 1] = fillColor.g;
                data[i + 2] = fillColor.b;
                data[i + 3] = 0; // Keep transparent for now
            }
        }
    }

    resetToOriginalImage() {
        this.processedImageData = null;
        this.updatePreview();
    }

    _downloadURI(uri, name) {
        const link = document.createElement('a');
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
    }

    _getCleanFileName() {
        return this.originalFileName;
    }

    _prepareDownloadCanvas(fill, fillColor = '#ffffff') {
        if (!this.originalImage) return null;

        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.previewCanvas.width;
        tempCanvas.height = this.previewCanvas.height;

        if (fill) {
            tempCtx.fillStyle = fillColor;
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }

        // Draw the current preview content
        if (this.processedImageData) {
            tempCtx.putImageData(this.processedImageData, 0, 0);
        } else {
            tempCtx.drawImage(this.originalImage, 0, 0);
        }

        return tempCanvas;
    }

    _downloadPngTransparent() {
        if (!this.originalImage) return;

        const canvas = this._prepareDownloadCanvas(false);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_contour_transparent.png`);
        }
    }

    _downloadPngWithBackground() {
        if (!this.originalImage) return;

        const bgColor = this.colorManager.getBgColor();
        const canvas = this._prepareDownloadCanvas(true, bgColor);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_contour_bg_${bgColor.replace('#','')}.png`);
        }
    }

    _downloadJpeg() {
        if (!this.originalImage) return;

        const bgColor = this.colorManager.getBgColor();
        const canvas = this._prepareDownloadCanvas(true, bgColor);
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            this._downloadURI(dataUrl, `${this._getCleanFileName()}_contour_bg_${bgColor.replace('#','')}.jpg`);
        }
    }

    _enableElements(enabled) {
        // Control elements
        if (this.thresholdSlider) this.thresholdSlider.disabled = !enabled;
        if (this.edgeWidthSlider) this.edgeWidthSlider.disabled = !enabled;
        if (this.outerContourOnlyCheckbox) this.outerContourOnlyCheckbox.disabled = !enabled;
        if (this.fillContourCheckbox) this.fillContourCheckbox.disabled = !enabled;
        if (this.applyContourBtn) this.applyContourBtn.disabled = !enabled;
        if (this.resetImageBtn) this.resetImageBtn.disabled = !enabled;

        // Download buttons
        if (this.downloadPngTransparentBtn) this.downloadPngTransparentBtn.disabled = !enabled;
        if (this.downloadPngBgColorBtn) this.downloadPngBgColorBtn.disabled = !enabled;
        if (this.downloadJpegBtn) this.downloadJpegBtn.disabled = !enabled;

        // Color pickers
        this.colorManager.disable(!enabled);
    }

    resetApp() {
        // Reset canvas
        if (this.previewCtx) {
            this.previewCtx.clearRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);
            this.previewCanvas.width = 300;
            this.previewCanvas.height = 150;
        }

        // Reset state
        this.originalImage = null;
        this.originalImageDataBase64 = null;
        this.originalFileName = 'contour_image';
        this.processedImageData = null;

        // Reset UI controls
        if (this.thresholdSlider) {
            this.thresholdSlider.value = 100;
        }
        if (this.thresholdValueDisplay) {
            this.thresholdValueDisplay.textContent = '100';
        }
        if (this.edgeWidthSlider) {
            this.edgeWidthSlider.value = 1;
        }
        if (this.edgeWidthValueDisplay) {
            this.edgeWidthValueDisplay.textContent = '1';
        }
        if (this.outerContourOnlyCheckbox) {
            this.outerContourOnlyCheckbox.checked = false;
        }
        if (this.fillContourCheckbox) {
            this.fillContourCheckbox.checked = false;
        }

        // Reset color manager
        this.colorManager.reset();

        // Reset file input
        if (this.imageUpload) {
            this.imageUpload.value = '';
        }
        if (this.dropZone) {
            this.dropZone.classList.remove('dragover');
        }

        // Disable UI elements
        this._enableElements(false);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ImageTrimApp();
});
// --- END OF FILE image_trim.js ---
