// --- START OF FILE color_manager.js ---
class ColorManager {
    constructor(sourceColorPickerElement, targetColorPickerElement, bgColorPickerElement) {
        this.sourceColorPicker = sourceColorPickerElement;
        this.targetColorPicker = targetColorPickerElement;
        this.bgColorPicker = bgColorPickerElement;
        this.targetTransparencySlider = document.getElementById('targetTransparencySlider');
        this.targetTransparencyValueDisplay = document.getElementById('targetTransparencyValueDisplay');
        this.pickingFromImage = false;
        this._setupEventListeners();
    }

    _setupEventListeners() {
        // No event listeners needed for color pickers as they handle their own input events
        // Add listener for transparency slider
        if (this.targetTransparencySlider) {
            this.targetTransparencySlider.addEventListener('input', () => {
                if (this.targetTransparencyValueDisplay) {
                    this.targetTransparencyValueDisplay.textContent = this.targetTransparencySlider.value;
                }
            });
        }
    }

    setSourceColor(hexColor) {
        if (this.sourceColorPicker) {
            this.sourceColorPicker.value = hexColor;
        }
    }

    getSourceColor() {
        return this.sourceColorPicker ? this.sourceColorPicker.value : '#FFFFFF';
    }

    setTargetColor(hexColor) {
        if (this.targetColorPicker) {
            this.targetColorPicker.value = hexColor;
        }
    }

    getTargetColor() {
        return this.targetColorPicker ? this.targetColorPicker.value : '#000000';
    }

    setTargetTransparency(value) {
        if (this.targetTransparencySlider) {
            this.targetTransparencySlider.value = value;
            if (this.targetTransparencyValueDisplay) {
                this.targetTransparencyValueDisplay.textContent = value;
            }
        }
    }

    getTargetTransparency() {
        return this.targetTransparencySlider ? parseInt(this.targetTransparencySlider.value, 10) : 0;
    }

    // Get target transparency as alpha value (0-1 range, where 0 is fully opaque and 1 is fully transparent)
    getTargetAlpha() {
        const transparency = this.getTargetTransparency();
        return transparency / 100;
    }

    setBgColor(hexColor) {
        if (this.bgColorPicker) {
            this.bgColorPicker.value = hexColor;
        }
    }

    getBgColor() {
        return this.bgColorPicker ? this.bgColorPicker.value : '#FFFFFF';
    }

    setPickingFromImage(isPicking) {
        this.pickingFromImage = isPicking;
    }

    isPickingFromImage() {
        return this.pickingFromImage;
    }

    disable(disabled) {
        if (this.sourceColorPicker) this.sourceColorPicker.disabled = disabled;
        if (this.targetColorPicker) this.targetColorPicker.disabled = disabled;
        if (this.targetTransparencySlider) this.targetTransparencySlider.disabled = disabled;
        if (this.bgColorPicker) this.bgColorPicker.disabled = disabled;
    }

    reset() {
        this.setSourceColor('#FFFFFF');
        this.setTargetColor('#000000');
        this.setTargetTransparency(0);
        this.setBgColor('#FFFFFF');
        this.setPickingFromImage(false);
    }
}
// --- END OF FILE color_manager.js ---
