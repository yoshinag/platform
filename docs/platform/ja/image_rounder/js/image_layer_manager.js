// --- START OF FILE image_layer_manager.js ---
class ImageLayerManager {
    constructor(scaleSlider, scaleDisplay, widthInput, heightInput, aspectLock, onUpdateCallback) {
        this.scaleSlider = scaleSlider;
        this.scaleDisplay = scaleDisplay;
        this.widthInput = widthInput;
        this.heightInput = heightInput;
        this.aspectLockCheckbox = aspectLock;
        this.onUpdate = onUpdateCallback; // Callback to notify main app

        // +/- ボタン
        this.decreaseScaleBtn = document.getElementById('decreaseScaleBtn');
        this.increaseScaleBtn = document.getElementById('increaseScaleBtn');

        this.currentWidth = 0;
        this.currentHeight = 0;
        this.originalWidth = 0;  // Original dimensions of the uploaded image
        this.originalHeight = 0;
        this.originalAspectRatio = 1; // Aspect ratio of the uploaded image
        this.currentScalePercentage = 100; // Scale relative to base layer

        this.baseLayerWidth = 0; // To calculate size from percentage
        this.baseLayerHeight = 0;

        this.isUserModifying = false; // Prevent event loops

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
            this.aspectLockCheckbox.addEventListener('change', () => this._handleDimensionInputChange('width')); // Recalc based on width
        }
        // +/- ボタンのイベントリスナー
        if (this.decreaseScaleBtn) {
            this.decreaseScaleBtn.addEventListener('click', () => this._adjustScale(-1));
        }
        if (this.increaseScaleBtn) {
            this.increaseScaleBtn.addEventListener('click', () => this._adjustScale(1));
        }
    }

    // +/- ボタンでスケールを調整するメソッド
    _adjustScale(amount) {
        if (this.isUserModifying) return;
        this.isUserModifying = true;

        // 現在の値を取得して調整
        let currentValue = parseInt(this.scaleSlider.value);
        let newValue = currentValue + amount;

        // 最小値と最大値の範囲内に収める
        newValue = Math.max(parseInt(this.scaleSlider.min), Math.min(parseInt(this.scaleSlider.max), newValue));

        // スライダーの値を更新
        this.scaleSlider.value = newValue;
        this.currentScalePercentage = newValue;
        if(this.scaleDisplay) this.scaleDisplay.textContent = newValue;

        // 寸法を更新
        this._updateDimensionsFromScale();

        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate(this.currentWidth, this.currentHeight);
    }

    _updateScaleFromDimensions() {
        if (this.baseLayerWidth > 0 && this.currentWidth > 0) {
            // Calculate scale based on width, assuming original aspect ratio is maintained for current dimensions
            // This might need refinement if currentWidth/Height don't match originalAspectRatio
            const expectedWidthAt100Percent = this.originalWidth * (this.baseLayerWidth / this.originalWidth) ; // This simplification is not quite right
            // if base aspect != image aspect.
            // A better way is to see which dim (W or H) is more constrained
            // by the base layer if we were to fit the image.
            // For now, let's use a simpler average or width-based scale.

            // If image is proportionally scaled to fit base width:
            // scale = (currentWidth / originalWidth) * 100
            // but currentWidth is also affected by baseLayerWidth IF scale is used.
            // Let's make scale relative to the *potential* size if the image layer *were* the base layer size
            // while maintaining its own aspect ratio.

            // Example: Image 800x600. Base 400x300.
            // If image is scaled to 200x150 (maintaining its aspect), scale = 50% of its potential in base.
            // (200 / 400) * 100 = 50% (if base was used as reference for 100% width)

            // Let's define 100% scale as: image layer takes up the base layer's width, height adjusted by image's aspect.
            // OR image layer takes up base layer's height, width adjusted. Whichever is smaller.
            let widthAt100 = this.baseLayerWidth;
            let heightAt100 = this.baseLayerWidth / this.originalAspectRatio;
            if (heightAt100 > this.baseLayerHeight) {
                heightAt100 = this.baseLayerHeight;
                widthAt100 = this.baseLayerHeight * this.originalAspectRatio;
            }

            if (widthAt100 > 0) {
                this.currentScalePercentage = Math.round((this.currentWidth / widthAt100) * 100);
            } else {
                this.currentScalePercentage = 100;
            }


        } else if (this.originalWidth > 0 && this.currentWidth > 0) { // Fallback if base layer size is 0
            this.currentScalePercentage = Math.round((this.currentWidth / this.originalWidth) * 100);
        } else {
            this.currentScalePercentage = 100;
        }
        if(this.scaleSlider) this.scaleSlider.value = this.currentScalePercentage;
        if(this.scaleDisplay) this.scaleDisplay.textContent = this.currentScalePercentage;
    }

    _updateDimensionsFromScale() {
        if (this.baseLayerWidth <= 0 || this.baseLayerHeight <= 0 || this.originalWidth <=0 || this.originalHeight <=0) {
            // Not enough info to scale relative to base, or no original image
            // Fallback to scaling original image dimensions directly if possible
            this.currentWidth = Math.round(this.originalWidth * (this.currentScalePercentage / 100));
            this.currentHeight = Math.round(this.originalHeight * (this.currentScalePercentage / 100));
        } else {
            // Determine the "fit" size of the image within the base layer at 100% scale
            // This means the image fits entirely within the base layer, maintaining its aspect ratio.
            let fitWidth = this.baseLayerWidth;
            let fitHeight = fitWidth / this.originalAspectRatio;

            if (fitHeight > this.baseLayerHeight) {
                fitHeight = this.baseLayerHeight;
                fitWidth = fitHeight * this.originalAspectRatio;
            }
            // Now, 'fitWidth' and 'fitHeight' represent the image layer size if it were at 100% scale *relative to fitting the base layer*.
            this.currentWidth = Math.round(fitWidth * (this.currentScalePercentage / 100));
            this.currentHeight = Math.round(fitHeight * (this.currentScalePercentage / 100));
        }

        this.currentWidth = getSafePositiveInt(this.currentWidth, 1);
        this.currentHeight = getSafePositiveInt(this.currentHeight, 1);

        if(this.widthInput) this.widthInput.value = this.currentWidth;
        if(this.heightInput) this.heightInput.value = this.currentHeight;
    }


    _handleScaleChange() {
        if (this.isUserModifying) return;
        this.isUserModifying = true;

        this.currentScalePercentage = getSafePositiveInt(this.scaleSlider.value, 100);
        if(this.scaleDisplay) this.scaleDisplay.textContent = this.currentScalePercentage;

        this._updateDimensionsFromScale();

        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate(this.currentWidth, this.currentHeight);
    }

    _handleDimensionInputChange(sourceField) {
        if (this.isUserModifying) return;
        this.isUserModifying = true;

        let w = getSafePositiveInt(this.widthInput.value, this.currentWidth);
        let h = getSafePositiveInt(this.heightInput.value, this.currentHeight);

        if (this.aspectLockCheckbox.checked && this.originalAspectRatio > 0) {
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

        this._updateScaleFromDimensions();

        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate(this.currentWidth, this.currentHeight);
    }

    setOriginalImageSize(width, height) {
        this.originalWidth = getSafePositiveInt(width, 1);
        this.originalHeight = getSafePositiveInt(height, 1);
        this.originalAspectRatio = this.originalWidth / this.originalHeight;
        if (this.originalAspectRatio <= 0) this.originalAspectRatio = 1;

        // When a new image is loaded, reset scale to 100% and update dimensions accordingly
        this.currentScalePercentage = 100;
        if(this.scaleSlider) this.scaleSlider.value = this.currentScalePercentage;
        if(this.scaleDisplay) this.scaleDisplay.textContent = this.currentScalePercentage;

        this._updateDimensionsFromScale(); // This will set currentWidth/Height based on new original and current base size
    }

    updateBaseLayerSize(baseW, baseH) {
        this.baseLayerWidth = getSafePositiveInt(baseW, 1);
        this.baseLayerHeight = getSafePositiveInt(baseH, 1);
        // If scale is driving size, re-calculate image layer dimensions
        this._updateDimensionsFromScale();
        // No onUpdate call here, main app will call updatePreview after this
    }


    getDimensions() {
        return { width: this.currentWidth, height: this.currentHeight };
    }

    disable(disabled) {
        if(this.scaleSlider) this.scaleSlider.disabled = disabled;
        // scaleDisplay is just text
        if(this.widthInput) this.widthInput.disabled = disabled;
        if(this.heightInput) this.heightInput.disabled = disabled;
        if(this.aspectLockCheckbox) this.aspectLockCheckbox.disabled = disabled;
        // +/- ボタンも無効/有効にする
        if(this.decreaseScaleBtn) this.decreaseScaleBtn.disabled = disabled;
        if(this.increaseScaleBtn) this.increaseScaleBtn.disabled = disabled;
    }

    reset(initialWidth = 0, initialHeight = 0) { // These are original image dimensions
        this.originalWidth = getSafePositiveInt(initialWidth, 1);
        this.originalHeight = getSafePositiveInt(initialHeight, 1);
        this.originalAspectRatio = (this.originalHeight > 0) ? this.originalWidth / this.originalHeight : 1;

        this.currentScalePercentage = 100;
        if(this.scaleSlider) this.scaleSlider.value = this.currentScalePercentage;
        if(this.scaleDisplay) this.scaleDisplay.textContent = this.currentScalePercentage;

        // Dimensions will be set based on scale and base layer size (which is also reset by main app)
        // or directly if initialWidth/Height provided (on first load)
        if (initialWidth > 0 && initialHeight > 0) {
            this.currentWidth = initialWidth;
            this.currentHeight = initialHeight;
        } else { // on reset without new image, calculate from scale and (reset) base size
            this._updateDimensionsFromScale();
        }

        if(this.widthInput) this.widthInput.value = this.currentWidth > 0 ? this.currentWidth : "";
        if(this.heightInput) this.heightInput.value = this.currentHeight > 0 ? this.currentHeight : "";
        if(this.aspectLockCheckbox) this.aspectLockCheckbox.checked = true;
    }
}
// --- END OF FILE image_layer_manager.js ---
