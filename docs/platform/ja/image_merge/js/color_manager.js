// --- START OF FILE color_manager.js ---
class ColorManager {
    constructor(colorPicker) {
        this.colorPicker = colorPicker;
        this.defaultColor = '#ffffff'; // White
        this.currentColor = this.defaultColor;
        
        this._setupEventListeners();
    }
    
    _setupEventListeners() {
        if (this.colorPicker) {
            this.colorPicker.addEventListener('input', () => {
                this.currentColor = this.colorPicker.value;
            });
        }
    }
    
    getRgbColor() {
        return this.currentColor || this.defaultColor;
    }
    
    disable(disabled) {
        if (this.colorPicker) {
            this.colorPicker.disabled = disabled;
        }
    }
    
    reset() {
        this.currentColor = this.defaultColor;
        if (this.colorPicker) {
            this.colorPicker.value = this.defaultColor;
        }
    }
}
// --- END OF FILE color_manager.js ---