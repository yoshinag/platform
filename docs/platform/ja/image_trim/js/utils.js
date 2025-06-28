// --- START OF FILE utils.js ---
function getSafeInt(value, defaultValue = 0) {
    const num = parseInt(value, 10);
    return isNaN(num) || num < 0 ? defaultValue : num;
}

function getSafePositiveInt(value, defaultValue = 1) {
    const num = parseInt(value, 10);
    return isNaN(num) || num <= 0 ? defaultValue : num;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Convert RGB color to grayscale using luminance method
function rgbToGrayscale(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

// Apply Sobel operator for edge detection
function applySobelOperator(imageData, width, height, threshold) {
    const data = imageData.data;
    const result = new Uint8ClampedArray(data.length);

    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0;
            let gy = 0;

            // Apply convolution
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const gray = rgbToGrayscale(data[idx], data[idx + 1], data[idx + 2]);

                    gx += gray * sobelX[(ky + 1) * 3 + (kx + 1)];
                    gy += gray * sobelY[(ky + 1) * 3 + (kx + 1)];
                }
            }

            // Calculate gradient magnitude
            const magnitude = Math.sqrt(gx * gx + gy * gy);

            // Apply threshold
            const idx = (y * width + x) * 4;
            const isEdge = magnitude > threshold;

            result[idx] = isEdge ? 0 : data[idx];
            result[idx + 1] = isEdge ? 0 : data[idx + 1];
            result[idx + 2] = isEdge ? 0 : data[idx + 2];
            result[idx + 3] = isEdge ? 255 : 0; // Edge pixels are opaque, non-edge are transparent
        }
    }

    return new ImageData(result, width, height);
}

// Dilate edges to make them thicker
function dilateEdges(imageData, width, height, thickness) {
    if (thickness <= 1) return imageData;

    const data = imageData.data;
    const result = new Uint8ClampedArray(data.length);

    // Copy original data
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i];
    }

    const radius = Math.floor(thickness / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            // If this is an edge pixel
            if (data[idx + 3] > 0) {
                // Dilate in a square around this pixel
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const ny = y + dy;
                        const nx = x + dx;

                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const nidx = (ny * width + nx) * 4;
                            result[nidx] = data[idx];
                            result[nidx + 1] = data[idx + 1];
                            result[nidx + 2] = data[idx + 2];
                            result[nidx + 3] = data[idx + 3];
                        }
                    }
                }
            }
        }
    }

    return new ImageData(result, width, height);
}
// Extract only the outer contour
function extractOuterContour(imageData, width, height) {
    const data = imageData.data;
    const result = new Uint8ClampedArray(data.length);

    // Copy original data
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i];
    }

    // First pass: Mark all edge pixels
    const isEdge = new Array(width * height).fill(false);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (data[idx + 3] > 0) { // If pixel is part of an edge
                isEdge[y * width + x] = true;
            }
        }
    }

    // Second pass: Keep only outer contour pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;

            // If this is an edge pixel
            if (isEdge[y * width + x]) {
                // Check if it's an outer contour pixel
                let isOuterContour = false;

                // Check if any of the 8 surrounding pixels is not an edge
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue; // Skip the center pixel

                        const ny = y + dy;
                        const nx = x + dx;

                        // If out of bounds or not an edge pixel, this is an outer contour
                        if (nx < 0 || nx >= width || ny < 0 || ny >= height || !isEdge[ny * width + nx]) {
                            isOuterContour = true;
                            break;
                        }
                    }
                    if (isOuterContour) break;
                }

                // If not an outer contour, make it transparent
                if (!isOuterContour) {
                    result[idx + 3] = 0;
                }
            }
        }
    }

    return new ImageData(result, width, height);
}
// --- END OF FILE utils.js ---
