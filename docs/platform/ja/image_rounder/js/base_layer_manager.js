// --- START OF FILE base_layer_manager.js ---
class BaseLayerManager {
    constructor(widthInput, customW, heightInput, customH, aspectLock, onUpdateCallback) {
        this.widthInput = widthInput;
        this.customWidthInput = customW; // Now hidden, kept for compatibility
        this.heightInput = heightInput;
        this.customHeightInput = customH; // Now hidden, kept for compatibility
        this.aspectLockCheckbox = aspectLock;
        this.onUpdate = onUpdateCallback; // Callback to notify main app of changes

        this.width = 0;
        this.height = 0;
        this.aspectRatio = 1; // Used when aspect lock is on for custom inputs
        this.isUserModifying = false; // Flag to prevent event loops

        this._setupEventListeners();
    }

    _setupEventListeners() {
        [this.widthInput, this.heightInput].forEach(input => {
            if (input) {
                input.addEventListener('input', (e) => this._handleInputChange(e.target));
                input.addEventListener('change', (e) => { // Sanitize on blur/enter
                    let val = getSafePositiveInt(e.target.value, (e.target === this.widthInput ? this.width : this.height));
                    e.target.value = val;
                    this._handleInputChange(e.target); // Re-evaluate
                });
            }
        });
        if (this.aspectLockCheckbox) {
            this.aspectLockCheckbox.addEventListener('change', () => this._handleInputChange(this.widthInput)); // Recalc based on width
        }
    }

    _handleInputChange(inputElement) {
        if (this.isUserModifying) return;
        this.isUserModifying = true;

        const value = getSafePositiveInt(inputElement.value, 0);
        const isWidthInput = inputElement === this.widthInput;
        const otherInput = isWidthInput ? this.heightInput : this.widthInput;

        // Update the internal dimension value
        if (isWidthInput) {
            this.width = value;
        } else {
            this.height = value;
        }

        // Handle aspect ratio locking
        if (this.aspectLockCheckbox.checked && this.aspectRatio > 0) {
            if (isWidthInput) {
                // Width changed, update height
                const newHeight = Math.round(this.width / this.aspectRatio);
                if (newHeight > 0) {
                    this.height = newHeight;
                    otherInput.value = newHeight;
                }
            } else {
                // Height changed, update width
                const newWidth = Math.round(this.height * this.aspectRatio);
                if (newWidth > 0) {
                    this.width = newWidth;
                    otherInput.value = newWidth;
                }
            }
        }

        // Ensure minimum values
        if (this.width < 1) this.width = 1;
        if (this.height < 1) this.height = 1;

        // Update aspect ratio if aspect lock is off
        if (!this.aspectLockCheckbox.checked && this.width > 0 && this.height > 0) {
            this.aspectRatio = this.width / this.height;
        }

        // Update hidden custom inputs for compatibility
        if (this.customWidthInput) this.customWidthInput.value = this.width;
        if (this.customHeightInput) this.customHeightInput.value = this.height;

        this.isUserModifying = false;
        if (this.onUpdate) this.onUpdate(this.width, this.height);
    }

    setDimensions(w, h, preserveAspectRatio = false) {
        this.isUserModifying = true; // Prevent triggering listeners during programmatic update

        this.width = getSafePositiveInt(w, 1);
        this.height = getSafePositiveInt(h, 1);

        if (this.width > 0 && this.height > 0) {
            this.aspectRatio = this.width / this.height;
        }

        // Set the input values directly
        if (this.widthInput) this.widthInput.value = this.width;
        if (this.heightInput) this.heightInput.value = this.height;

        // Update hidden custom inputs for compatibility
        if (this.customWidthInput) this.customWidthInput.value = this.width;
        if (this.customHeightInput) this.customHeightInput.value = this.height;

        this.isUserModifying = false;
        // Do not call onUpdate here, as this is usually called by the main app (e.g., on file load)
    }

    getDimensions() {
        return { width: this.width, height: this.height };
    }

    disable(disabled) {
        if(this.widthInput) this.widthInput.disabled = disabled;
        if(this.heightInput) this.heightInput.disabled = disabled;
        if(this.customWidthInput) this.customWidthInput.disabled = disabled;
        if(this.customHeightInput) this.customHeightInput.disabled = disabled;
        if(this.aspectLockCheckbox) this.aspectLockCheckbox.disabled = disabled;
    }

    reset(initialWidth = 0, initialHeight = 0) {
        this.width = getSafePositiveInt(initialWidth, 1);
        this.height = getSafePositiveInt(initialHeight, 1);
        this.aspectRatio = (this.height > 0) ? this.width / this.height : 1;

        if (this.widthInput) this.widthInput.value = initialWidth > 0 ? initialWidth : "";
        if (this.heightInput) this.heightInput.value = initialHeight > 0 ? initialHeight : "";
        if (this.customWidthInput) this.customWidthInput.value = initialWidth > 0 ? initialWidth : "";
        if (this.customHeightInput) this.customHeightInput.value = initialHeight > 0 ? initialHeight : "";
        if (this.aspectLockCheckbox) this.aspectLockCheckbox.checked = true;
        // No onUpdate call on reset to avoid loops if main app also resets
    }
}
// --- END OF FILE base_layer_manager.js ---
