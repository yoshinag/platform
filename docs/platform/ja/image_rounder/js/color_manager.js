// --- START OF FILE color_manager.js ---
class ColorManager {
    constructor(rgbPickerElement) {
        this.rgbPicker = rgbPickerElement;
        this._setupEventListeners();
    }

    _setupEventListeners() {
        // No event listeners needed for RGB picker as it handles its own input events
    }

    setRgbColor(hexColor) {
        if (this.rgbPicker) {
            this.rgbPicker.value = hexColor;
        }
    }

    getRgbColor() {
        return this.rgbPicker ? this.rgbPicker.value : '#FFFFFF';
    }

    disable(disabled) {
        if (this.rgbPicker) this.rgbPicker.disabled = disabled;
    }

    reset() {
        this.setRgbColor('#FFFFFF');
    }
}
// --- END OF FILE color_manager.js ---
