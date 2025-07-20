// --- START OF FILE utils.js ---
function getSafeInt(value, defaultValue = 0) {
    const num = parseInt(value, 10);
    return isNaN(num) || num < 0 ? defaultValue : num;
}

function getSafePositiveInt(value, defaultValue = 1) {
    const num = parseInt(value, 10);
    return isNaN(num) || num <= 0 ? defaultValue : num;
}
// --- END OF FILE utils.js ---