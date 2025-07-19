// Get DOM elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const encodeBtn = document.getElementById('encodeBtn');
const decodeBtn = document.getElementById('decodeBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

// Function to encode text to Base64
function encodeToBase64() {
    try {
        const input = inputText.value;
        if (!input) {
            outputText.value = '';
            return;
        }
        
        // Use built-in btoa function for Base64 encoding
        // First encode to UTF-8 to handle non-ASCII characters
        const encoded = btoa(unescape(encodeURIComponent(input)));
        outputText.value = encoded;
    } catch (error) {
        outputText.value = 'エラー: ' + error.message;
    }
}

// Function to decode Base64 to text
function decodeFromBase64() {
    try {
        const input = inputText.value;
        if (!input) {
            outputText.value = '';
            return;
        }
        
        // Use built-in atob function for Base64 decoding
        // Then decode from UTF-8
        const decoded = decodeURIComponent(escape(atob(input)));
        outputText.value = decoded;
    } catch (error) {
        outputText.value = 'エラー: 無効なBase64文字列です';
    }
}

// Function to clear both input and output
function clearText() {
    inputText.value = '';
    outputText.value = '';
    inputText.focus();
}

// Function to copy output to clipboard
function copyToClipboard() {
    if (!outputText.value) return;
    
    outputText.select();
    document.execCommand('copy');
    
    // Show temporary "Copied!" message
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'コピーしました！';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// Add event listeners
encodeBtn.addEventListener('click', encodeToBase64);
decodeBtn.addEventListener('click', decodeFromBase64);
clearBtn.addEventListener('click', clearText);
copyBtn.addEventListener('click', copyToClipboard);