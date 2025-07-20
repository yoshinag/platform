// Get DOM elements
// Tab elements
const decodeTab = document.getElementById('decodeTab');
const encodeTab = document.getElementById('encodeTab');
const decodeContent = document.getElementById('decodeContent');
const encodeContent = document.getElementById('encodeContent');

// Decode tab elements
const jwtInput = document.getElementById('jwtInput');
const decodeBtn = document.getElementById('decodeBtn');
const clearDecodeBtn = document.getElementById('clearDecodeBtn');
const headerOutput = document.getElementById('headerOutput');
const payloadOutput = document.getElementById('payloadOutput');
const signatureOutput = document.getElementById('signatureOutput');

// Encode tab elements
const headerInput = document.getElementById('headerInput');
const payloadInput = document.getElementById('payloadInput');
const secretInput = document.getElementById('secretInput');
const encodeBtn = document.getElementById('encodeBtn');
const clearEncodeBtn = document.getElementById('clearEncodeBtn');
const tokenOutput = document.getElementById('tokenOutput');
const copyBtn = document.getElementById('copyBtn');

// Tab switching functionality
decodeTab.addEventListener('click', () => {
    decodeTab.classList.add('active');
    encodeTab.classList.remove('active');
    decodeContent.classList.remove('hidden');
    encodeContent.classList.add('hidden');
});

encodeTab.addEventListener('click', () => {
    encodeTab.classList.add('active');
    decodeTab.classList.remove('active');
    encodeContent.classList.remove('hidden');
    decodeContent.classList.add('hidden');
});

// Base64 URL encoding and decoding functions
function base64UrlEncode(str) {
    // Convert the string to UTF-8 bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    
    // Convert bytes to binary string that btoa can handle
    let binaryStr = '';
    for (let i = 0; i < bytes.length; i++) {
        binaryStr += String.fromCharCode(bytes[i]);
    }
    
    // Convert the binary string to base64
    let base64 = btoa(binaryStr);
    
    // Make it URL safe
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
    // Add padding if needed
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (str.length % 4) {
        case 0:
            break;
        case 2:
            str += '==';
            break;
        case 3:
            str += '=';
            break;
        default:
            throw new Error('Invalid base64url string');
    }
    
    try {
        // Decode base64 to binary string
        const binaryStr = atob(str);
        
        // Convert binary string to UTF-8 bytes
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        
        // Convert UTF-8 bytes to string
        const decoder = new TextDecoder();
        return decoder.decode(bytes);
    } catch (e) {
        throw new Error('Invalid base64 string');
    }
}

// Function to decode JWT
async function decodeJWT() {
    try {
        const jwt = jwtInput.value.trim();
        if (!jwt) {
            clearDecodeOutputs();
            return;
        }
        
        // Split the JWT into its three parts
        const parts = jwt.split('.');
        if (parts.length !== 3) {
            throw new Error('無効なJWTフォーマットです。JWTは3つのドット区切りの部分で構成されている必要があります。');
        }
        
        let headerJson;
        // Decode header
        try {
            const decodedHeader = base64UrlDecode(parts[0]);
            headerJson = JSON.parse(decodedHeader);
            headerOutput.value = JSON.stringify(headerJson, null, 2);
        } catch (e) {
            headerOutput.value = 'ヘッダーのデコードエラー: ' + e.message;
            return;
        }
        
        // Decode payload
        try {
            const decodedPayload = base64UrlDecode(parts[1]);
            const payloadJson = JSON.parse(decodedPayload);
            payloadOutput.value = JSON.stringify(payloadJson, null, 2);
        } catch (e) {
            payloadOutput.value = 'ペイロードのデコードエラー: ' + e.message;
            return;
        }
        
        // Display signature
        signatureOutput.value = parts[2];
        
        // Add verification status message
        const secret = secretInput.value;
        if (secret) {
            try {
                const isValid = await verifySignature(parts[0] + '.' + parts[1], parts[2], secret, headerJson.alg || 'HS256');
                signatureOutput.value += '\n\n検証結果: ' + (isValid ? '有効な署名です' : '無効な署名です');
            } catch (e) {
                signatureOutput.value += '\n\n検証エラー: ' + e.message;
            }
        } else {
            signatureOutput.value += '\n\n検証するにはシークレットキーを入力してください。';
        }
        
    } catch (error) {
        clearDecodeOutputs();
        headerOutput.value = 'エラー: ' + error.message;
    }
}

// Function to encode JWT
async function encodeJWT() {
    try {
        // Get header and payload from inputs
        const header = headerInput.value.trim();
        const payload = payloadInput.value.trim();
        const secret = secretInput.value;
        
        if (!header || !payload) {
            tokenOutput.value = 'ヘッダーとペイロードを入力してください。';
            return;
        }
        
        // Parse JSON to validate and format
        let headerObj, payloadObj;
        try {
            headerObj = JSON.parse(header);
        } catch (e) {
            throw new Error('ヘッダーが有効なJSON形式ではありません: ' + e.message);
        }
        
        try {
            payloadObj = JSON.parse(payload);
        } catch (e) {
            throw new Error('ペイロードが有効なJSON形式ではありません: ' + e.message);
        }
        
        // Encode header and payload
        const encodedHeader = base64UrlEncode(JSON.stringify(headerObj));
        const encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));
        
        // Create the signature part
        let signature = '';
        const unsignedToken = encodedHeader + '.' + encodedPayload;
        
        if (secret) {
            try {
                signature = await createSignature(unsignedToken, secret, headerObj.alg || 'HS256');
            } catch (e) {
                throw new Error('署名の作成に失敗しました: ' + e.message);
            }
        } else {
            // If no secret is provided, we'll just use a placeholder
            signature = 'signature_placeholder';
        }
        
        // Combine all parts
        const jwt = unsignedToken + '.' + signature;
        tokenOutput.value = jwt;
        
    } catch (error) {
        tokenOutput.value = 'エラー: ' + error.message;
    }
}

// Function to get crypto algorithm configuration
function getCryptoAlgorithm(algorithm) {
    let cryptoAlg;
    switch (algorithm.toUpperCase()) {
        case 'HS256':
            cryptoAlg = { name: 'HMAC', hash: { name: 'SHA-256' } };
            break;
        case 'HS384':
            cryptoAlg = { name: 'HMAC', hash: { name: 'SHA-384' } };
            break;
        case 'HS512':
            cryptoAlg = { name: 'HMAC', hash: { name: 'SHA-512' } };
            break;
        default:
            throw new Error('サポートされていないアルゴリズムです: ' + algorithm);
    }
    return cryptoAlg;
}

// Function to create a proper signature using Web Crypto API
async function createSignature(data, secret, algorithm = 'HS256') {
    // Get crypto algorithm configuration
    const cryptoAlg = getCryptoAlgorithm(algorithm);
    
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const secretBuffer = encoder.encode(secret);
    
    // Import the secret key
    const key = await crypto.subtle.importKey(
        'raw',
        secretBuffer,
        cryptoAlg,
        false,
        ['sign']
    );
    
    // Sign the data
    const signatureBuffer = await crypto.subtle.sign(
        cryptoAlg.name,
        key,
        dataBuffer
    );
    
    // Convert signature to base64url
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureBytes = new Uint8Array(signatureArray).buffer;
    const signatureBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(signatureBytes)));
    
    // Make it URL safe
    return signatureBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Function to verify a JWT signature
async function verifySignature(data, signature, secret, algorithm = 'HS256') {
    // Get crypto algorithm configuration
    const cryptoAlg = getCryptoAlgorithm(algorithm);
    
    // Convert string to ArrayBuffer
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const secretBuffer = encoder.encode(secret);
    
    // Convert base64url signature to ArrayBuffer
    let signatureBase64 = signature.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    switch (signatureBase64.length % 4) {
        case 2: signatureBase64 += '=='; break;
        case 3: signatureBase64 += '='; break;
    }
    
    let signatureBuffer;
    try {
        const binaryStr = atob(signatureBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
        }
        signatureBuffer = bytes.buffer;
    } catch (e) {
        throw new Error('署名のデコードに失敗しました: ' + e.message);
    }
    
    // Import the secret key
    const key = await crypto.subtle.importKey(
        'raw',
        secretBuffer,
        cryptoAlg,
        false,
        ['verify']
    );
    
    // Verify the signature
    return await crypto.subtle.verify(
        cryptoAlg.name,
        key,
        signatureBuffer,
        dataBuffer
    );
}

// Function to clear decode outputs
function clearDecodeOutputs() {
    headerOutput.value = '';
    payloadOutput.value = '';
    signatureOutput.value = '';
}

// Function to clear decode inputs and outputs
function clearDecode() {
    jwtInput.value = '';
    clearDecodeOutputs();
    jwtInput.focus();
}

// Function to clear encode inputs and outputs
function clearEncode() {
    headerInput.value = '{\n  "alg": "HS256",\n  "typ": "JWT"\n}';
    payloadInput.value = '{\n  "sub": "1234567890",\n  "name": "山田太郎",\n  "iat": 1516239022\n}';
    secretInput.value = 'your-256-bit-secret';
    tokenOutput.value = '';
    headerInput.focus();
}

// Function to copy output to clipboard
function copyToClipboard() {
    if (!tokenOutput.value) return;
    
    tokenOutput.select();
    document.execCommand('copy');
    
    // Show temporary "Copied!" message
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'コピーしました！';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// Add event listeners
decodeBtn.addEventListener('click', () => {
    decodeJWT().catch(error => {
        console.error('JWT decode error:', error);
        headerOutput.value = 'エラー: ' + error.message;
    });
});
clearDecodeBtn.addEventListener('click', clearDecode);
encodeBtn.addEventListener('click', () => {
    encodeJWT().catch(error => {
        console.error('JWT encode error:', error);
        tokenOutput.value = 'エラー: ' + error.message;
    });
});
clearEncodeBtn.addEventListener('click', clearEncode);
copyBtn.addEventListener('click', copyToClipboard);

// Initialize with default values
clearEncode();