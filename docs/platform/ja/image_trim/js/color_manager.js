// --- START OF FILE color_manager.js ---
class ColorManager {
    constructor(bgColorPicker, edgeColorPicker, fillColorPicker) {
        this.bgColorPicker = bgColorPicker;
        this.edgeColorPicker = edgeColorPicker;
        this.fillColorPicker = fillColorPicker;
        this._setupEventListeners();
    }

    _setupEventListeners() {
        // No event listeners needed for color pickers as they handle their own input events
    }

    // Background color methods
    setBgColor(hexColor) {
        if (this.bgColorPicker) {
            this.bgColorPicker.value = hexColor;
        }
    }

    getBgColor() {
        return this.bgColorPicker ? this.bgColorPicker.value : '#FFFFFF';
    }

    // Edge color methods
    setEdgeColor(hexColor) {
        if (this.edgeColorPicker) {
            this.edgeColorPicker.value = hexColor;
        }
    }

    getEdgeColor() {
        return this.edgeColorPicker ? this.edgeColorPicker.value : '#000000';
    }

    // Fill color methods
    setFillColor(hexColor) {
        if (this.fillColorPicker) {
            this.fillColorPicker.value = hexColor;
        }
    }

    getFillColor() {
        return this.fillColorPicker ? this.fillColorPicker.value : '#FFFFFF';
    }

    // Convert hex color to RGB components
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace(/^#/, '');
        
        // Parse hex values
        let r, g, b;
        if (hex.length === 3) {
            // Short notation (#RGB)
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else {
            // Full notation (#RRGGBB)
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        
        return { r, g, b };
    }

    disable(disabled) {
        if (this.bgColorPicker) this.bgColorPicker.disabled = disabled;
        if (this.edgeColorPicker) this.edgeColorPicker.disabled = disabled;
        if (this.fillColorPicker) this.fillColorPicker.disabled = disabled;
    }

    reset() {
        this.setBgColor('#FFFFFF');
        this.setEdgeColor('#000000');
        this.setFillColor('#FFFFFF');
    }
}
// --- END OF FILE color_manager.js ---