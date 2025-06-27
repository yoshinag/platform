// --- START OF FILE base_image_manager.js ---
class BaseImageManager {
    constructor(onUpdateCallback) {
        this.baseImage = null;
        this.baseImageDataBase64 = null;
        this.originalFileName = 'merged_image';
        this.width = 0;
        this.height = 0;
        this.onUpdate = onUpdateCallback;
    }

    setImage(image, imageDataBase64, fileName) {
        this.baseImage = image;
        this.baseImageDataBase64 = imageDataBase64;
        this.originalFileName = fileName || 'merged_image';
        this.width = image ? image.naturalWidth : 0;
        this.height = image ? image.naturalHeight : 0;
        
        if (this.onUpdate) {
            this.onUpdate(this.width, this.height);
        }
    }

    getImage() {
        return this.baseImage;
    }

    getImageDataBase64() {
        return this.baseImageDataBase64;
    }

    getFileName() {
        return this.originalFileName;
    }

    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }

    reset() {
        this.baseImage = null;
        this.baseImageDataBase64 = null;
        this.originalFileName = 'merged_image';
        this.width = 0;
        this.height = 0;
        
        if (this.onUpdate) {
            this.onUpdate(this.width, this.height);
        }
    }
}
// --- END OF FILE base_image_manager.js ---