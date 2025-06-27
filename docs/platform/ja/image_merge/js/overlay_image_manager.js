// --- START OF FILE overlay_image_manager.js ---
class OverlayImageManager {
    constructor(scaleSlider, scaleDisplay, widthInput, heightInput, aspectLock, positionXInput, positionYInput, opacitySlider, opacityDisplay, onUpdateCallback) {
        // UI Elements
        this.scaleSlider = scaleSlider;
        this.scaleDisplay = scaleDisplay;
        this.widthInput = widthInput;
        this.heightInput = heightInput;
        this.aspectLockCheckbox = aspectLock;
        this.positionXInput = positionXInput;
        this.positionYInput = positionYInput;
        this.opacitySlider = opacitySlider;
        this.opacityDisplay = opacityDisplay;
        
        // +/- ボタン
        this.decreaseScaleBtn = document.getElementById('decreaseScaleBtn');
        this.increaseScaleBtn = document.getElementById('increaseScaleBtn');
        
        // State
        this.overlayImage = null;
        this.overlayImageDataBase64 = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.originalAspectRatio = 1;
        this.currentWidth = 0;
        this.currentHeight = 0;
        this.positionX = 0;
        this.positionY = 0;
        this.opacity = 100; // 0-100
        this.currentScalePercentage = 100;
        
        this.baseLayerWidth = 0;
        this.baseLayerHeight = 0;
        
        this.isUserModifying = false;
        this.onUpdate = onUpdateCallback;
        
        this._setupEventListeners();
    }
    
    _setupEventListeners() {
        if (this.scaleSlider) {
            this.scaleSlider.addEventListener('input', () => this._handleScaleChange());
        }
        
        if (this.widthInput) {
            this.widthInput.addEventListener('input', () => this._handleDimensionInputChange('width'));
            this.widthInput.addEventListener('change', () => {
                let val = getSafePositiveInt(this.widthInput.value, this.currentWidth);
                this.widthInput.value = val;
                this._handleDimensionInputChange('width');
            });
        }
        
        if (this.heightInput) {
            this.heightInput.addEventListener('input', () => this._handleDimensionInputChange('height'));
            this.heightInput.addEventListener('change', () => {
                let val = getSafePositiveInt(this.heightInput.value, this.currentHeight);
                this.heightInput.value = val;
                this._handleDimensionInputChange('height');
            });
        }
        
        if (this.aspectLockCheckbox) {
            this.aspectLockCheckbox.addEventListener('change', () => this._handleDimensionInputChange('width'));
        }
        
        if (this.positionXInput) {
            this.positionXInput.addEventListener('input', () => this._handlePositionChange('x'));
            this.positionXInput.addEventListener('change', () => {
                let val = getSafeInt(this.positionXInput.value, this.positionX);
                this.positionXInput.value = val;
                this._handlePositionChange('x');
            });
        }
        
        if (this.positionYInput) {
            this.positionYInput.addEventListener('input', () => this._handlePositionChange('y'));
            this.positionYInput.addEventListener('change', () => {
                let val = getSafeInt(this.positionYInput.value, this.positionY);
                this.positionYInput.value = val;
                this._handlePositionChange('y');
            });
        }
        
        if (this.opacitySlider) {
            this.opacitySlider.addEventListener('input', () => this._handleOpacityChange());
        }
        
        // +/- ボタンのイベントリスナー
        if (this.decreaseScaleBtn) {
            this.decreaseScaleBtn.addEventListener('click', () => this._adjustScale(-1));
        }
        if (this.increaseScaleBtn) {
            this.increaseScaleBtn.addEventListener('click', () => this._adjustScale(1));
        }
    }
    
    _adjustScale(amount) {
        if (this.isUserModifying) return;
        this.isUserModifying = true;
        
        let currentValue = parseInt(this.scaleSlider.value);
        let newValue = currentValue + amount;
        
        newValue = Math.max(parseInt(this.scaleSlider.min), Math.min(parseInt(this.scaleSlider.max), newValue));
        
        this.scaleSlider.value = newValue;
        this.currentScalePercentage = newValue;
        if (this.scaleDisplay) this.scaleDisplay.textContent = newValue;
        
        this._updateDimensionsFromScale();
        
        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate();
    }
    
    _handleScaleChange() {
        if (this.isUserModifying) return;
        this.isUserModifying = true;
        
        this.currentScalePercentage = getSafePositiveInt(this.scaleSlider.value, 100);
        if (this.scaleDisplay) this.scaleDisplay.textContent = this.currentScalePercentage;
        
        this._updateDimensionsFromScale();
        
        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate();
    }
    
    _updateDimensionsFromScale() {
        if (this.originalWidth <= 0 || this.originalHeight <= 0) {
            return;
        }
        
        this.currentWidth = Math.round(this.originalWidth * (this.currentScalePercentage / 100));
        this.currentHeight = Math.round(this.originalHeight * (this.currentScalePercentage / 100));
        
        this.currentWidth = getSafePositiveInt(this.currentWidth, 1);
        this.currentHeight = getSafePositiveInt(this.currentHeight, 1);
        
        if (this.widthInput) this.widthInput.value = this.currentWidth;
        if (this.heightInput) this.heightInput.value = this.currentHeight;
    }
    
    _handleDimensionInputChange(sourceField) {
        if (this.isUserModifying) return;
        this.isUserModifying = true;
        
        let w = getSafePositiveInt(this.widthInput.value, this.currentWidth);
        let h = getSafePositiveInt(this.heightInput.value, this.currentHeight);
        
        if (this.aspectLockCheckbox && this.aspectLockCheckbox.checked && this.originalAspectRatio > 0) {
            if (sourceField === 'width') {
                h = Math.round(w / this.originalAspectRatio);
                if (h < 1) h = 1;
                this.heightInput.value = h;
            } else { // source 'height'
                w = Math.round(h * this.originalAspectRatio);
                if (w < 1) w = 1;
                this.widthInput.value = w;
            }
        }
        
        this.currentWidth = getSafePositiveInt(this.widthInput.value, 1);
        this.currentHeight = getSafePositiveInt(this.heightInput.value, 1);
        
        // Update scale percentage based on new dimensions
        if (this.originalWidth > 0) {
            this.currentScalePercentage = Math.round((this.currentWidth / this.originalWidth) * 100);
            if (this.scaleSlider) this.scaleSlider.value = this.currentScalePercentage;
            if (this.scaleDisplay) this.scaleDisplay.textContent = this.currentScalePercentage;
        }
        
        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate();
    }
    
    _handlePositionChange(axis) {
        if (this.isUserModifying) return;
        this.isUserModifying = true;
        
        if (axis === 'x') {
            this.positionX = getSafeInt(this.positionXInput.value, 0);
        } else { // axis === 'y'
            this.positionY = getSafeInt(this.positionYInput.value, 0);
        }
        
        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate();
    }
    
    _handleOpacityChange() {
        if (this.isUserModifying) return;
        this.isUserModifying = true;
        
        this.opacity = getSafeInt(this.opacitySlider.value, 100);
        if (this.opacityDisplay) this.opacityDisplay.textContent = this.opacity;
        
        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate();
    }
    
    setImage(image, imageDataBase64) {
        this.overlayImage = image;
        this.overlayImageDataBase64 = imageDataBase64;
        
        if (image) {
            this.originalWidth = getSafePositiveInt(image.naturalWidth, 1);
            this.originalHeight = getSafePositiveInt(image.naturalHeight, 1);
            this.originalAspectRatio = this.originalWidth / this.originalHeight;
            if (this.originalAspectRatio <= 0) this.originalAspectRatio = 1;
            
            // Reset scale to 100%
            this.currentScalePercentage = 100;
            if (this.scaleSlider) this.scaleSlider.value = this.currentScalePercentage;
            if (this.scaleDisplay) this.scaleDisplay.textContent = this.currentScalePercentage;
            
            // Update dimensions based on scale
            this._updateDimensionsFromScale();
            
            // Center the overlay image on the base image
            if (this.baseLayerWidth > 0 && this.baseLayerHeight > 0) {
                this.positionX = Math.floor((this.baseLayerWidth - this.currentWidth) / 2);
                this.positionY = Math.floor((this.baseLayerHeight - this.currentHeight) / 2);
                
                if (this.positionXInput) this.positionXInput.value = this.positionX;
                if (this.positionYInput) this.positionYInput.value = this.positionY;
            }
        }
        
        if (this.onUpdate) this.onUpdate();
    }
    
    updateBaseLayerSize(baseW, baseH) {
        this.baseLayerWidth = getSafePositiveInt(baseW, 1);
        this.baseLayerHeight = getSafePositiveInt(baseH, 1);
        
        // Center the overlay image on the base image if we have an overlay image
        if (this.overlayImage) {
            this.positionX = Math.floor((this.baseLayerWidth - this.currentWidth) / 2);
            this.positionY = Math.floor((this.baseLayerHeight - this.currentHeight) / 2);
            
            if (this.positionXInput) this.positionXInput.value = this.positionX;
            if (this.positionYInput) this.positionYInput.value = this.positionY;
        }
        
        if (this.onUpdate) this.onUpdate();
    }
    
    getImage() {
        return this.overlayImage;
    }
    
    getImageDataBase64() {
        return this.overlayImageDataBase64;
    }
    
    getDimensions() {
        return {
            width: this.currentWidth,
            height: this.currentHeight
        };
    }
    
    getPosition() {
        return {
            x: this.positionX,
            y: this.positionY
        };
    }
    
    getOpacity() {
        return this.opacity / 100; // Convert to 0-1 range
    }
    
    disable(disabled) {
        if (this.scaleSlider) this.scaleSlider.disabled = disabled;
        if (this.widthInput) this.widthInput.disabled = disabled;
        if (this.heightInput) this.heightInput.disabled = disabled;
        if (this.aspectLockCheckbox) this.aspectLockCheckbox.disabled = disabled;
        if (this.positionXInput) this.positionXInput.disabled = disabled;
        if (this.positionYInput) this.positionYInput.disabled = disabled;
        if (this.opacitySlider) this.opacitySlider.disabled = disabled;
        if (this.decreaseScaleBtn) this.decreaseScaleBtn.disabled = disabled;
        if (this.increaseScaleBtn) this.increaseScaleBtn.disabled = disabled;
    }
    
    reset() {
        this.overlayImage = null;
        this.overlayImageDataBase64 = null;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.originalAspectRatio = 1;
        this.currentWidth = 0;
        this.currentHeight = 0;
        this.positionX = 0;
        this.positionY = 0;
        this.opacity = 100;
        this.currentScalePercentage = 100;
        
        if (this.scaleSlider) this.scaleSlider.value = this.currentScalePercentage;
        if (this.scaleDisplay) this.scaleDisplay.textContent = this.currentScalePercentage;
        if (this.widthInput) this.widthInput.value = "";
        if (this.heightInput) this.heightInput.value = "";
        if (this.positionXInput) this.positionXInput.value = this.positionX;
        if (this.positionYInput) this.positionYInput.value = this.positionY;
        if (this.opacitySlider) this.opacitySlider.value = this.opacity;
        if (this.opacityDisplay) this.opacityDisplay.textContent = this.opacity;
        if (this.aspectLockCheckbox) this.aspectLockCheckbox.checked = true;
        
        if (this.onUpdate) this.onUpdate();
    }
}
// --- END OF FILE overlay_image_manager.js ---