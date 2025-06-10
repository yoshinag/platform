// --- START OF FILE color_manager.js ---
class ColorManager {
    constructor(sourceColorPickerElement, targetColorPickerElement, bgColorPickerElement) {
        this.sourceColorPicker = sourceColorPickerElement;
        this.targetColorPicker = targetColorPickerElement;
        this.bgColorPicker = bgColorPickerElement;
        this.pickingFromImage = false;
        this._setupEventListeners();
    }

    _setupEventListeners() {
        // No event listeners needed for color pickers as they handle their own input events
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
        if (this.bgColorPicker) this.bgColorPicker.disabled = disabled;
    }

    reset() {
        this.setSourceColor('#FFFFFF');
        this.setTargetColor('#000000');
        this.setBgColor('#FFFFFF');
        this.setPickingFromImage(false);
    }
}
// --- END OF FILE color_manager.js ---