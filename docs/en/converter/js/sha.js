// Get DOM elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const generateSHA1Btn = document.getElementById('generateSHA1Btn');
const generateSHA256Btn = document.getElementById('generateSHA256Btn');
const generateSHA512Btn = document.getElementById('generateSHA512Btn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');

// Function to generate SHA-1 hash
async function generateSHA1Hash() {
    try {
        const input = inputText.value;
        if (!input) {
            outputText.value = '';
            return;
        }
        
        // Convert string to ArrayBuffer
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        
        // Use SubtleCrypto API to generate SHA-1 hash
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        
        // Convert ArrayBuffer to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        outputText.value = hashHex;
    } catch (error) {
        outputText.value = 'Error: ' + error.message;
    }
}

// Function to generate SHA-256 hash
async function generateSHA256Hash() {
    try {
        const input = inputText.value;
        if (!input) {
            outputText.value = '';
            return;
        }
        
        // Convert string to ArrayBuffer
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        
        // Use SubtleCrypto API to generate SHA-256 hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        // Convert ArrayBuffer to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        outputText.value = hashHex;
    } catch (error) {
        outputText.value = 'Error: ' + error.message;
    }
}

// Function to generate SHA-512 hash
async function generateSHA512Hash() {
    try {
        const input = inputText.value;
        if (!input) {
            outputText.value = '';
            return;
        }
        
        // Convert string to ArrayBuffer
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        
        // Use SubtleCrypto API to generate SHA-512 hash
        const hashBuffer = await crypto.subtle.digest('SHA-512', data);
        
        // Convert ArrayBuffer to hex string
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        outputText.value = hashHex;
    } catch (error) {
        outputText.value = 'Error: ' + error.message;
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
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// Add event listeners
generateSHA1Btn.addEventListener('click', generateSHA1Hash);
generateSHA256Btn.addEventListener('click', generateSHA256Hash);
generateSHA512Btn.addEventListener('click', generateSHA512Hash);
clearBtn.addEventListener('click', clearText);
copyBtn.addEventListener('click', copyToClipboard);