// Test script for JWT encoding and decoding functionality
// This can be run in the browser console after loading the JWT page

async function testJWTFunctionality() {
    console.log('Starting JWT functionality test...');
    
    // Test data
    const testHeader = {
        "alg": "HS256",
        "typ": "JWT"
    };
    const testPayload = {
        "sub": "1234567890",
        "name": "テストユーザー",
        "iat": 1516239022
    };
    const testSecret = "your-256-bit-secret";
    
    // Test encoding
    console.log('Testing JWT encoding...');
    
    // Set input values
    headerInput.value = JSON.stringify(testHeader, null, 2);
    payloadInput.value = JSON.stringify(testPayload, null, 2);
    secretInput.value = testSecret;
    
    // Encode JWT
    await encodeJWT();
    
    // Get the encoded token
    const encodedToken = tokenOutput.value;
    console.log('Encoded JWT:', encodedToken);
    
    if (!encodedToken || encodedToken.split('.').length !== 3) {
        console.error('Encoding test failed: Invalid token format');
        return;
    }
    
    console.log('Encoding test passed');
    
    // Test decoding
    console.log('Testing JWT decoding...');
    
    // Set input value
    jwtInput.value = encodedToken;
    
    // Decode JWT
    await decodeJWT();
    
    // Verify decoded values
    const decodedHeader = JSON.parse(headerOutput.value);
    const decodedPayload = JSON.parse(payloadOutput.value);
    
    console.log('Decoded header:', decodedHeader);
    console.log('Decoded payload:', decodedPayload);
    
    // Check if header matches
    if (JSON.stringify(decodedHeader) !== JSON.stringify(testHeader)) {
        console.error('Decoding test failed: Header mismatch');
        return;
    }
    
    // Check if payload matches
    if (JSON.stringify(decodedPayload) !== JSON.stringify(testPayload)) {
        console.error('Decoding test failed: Payload mismatch');
        return;
    }
    
    // Check if signature verification message is present
    if (!signatureOutput.value.includes('有効な署名です')) {
        console.error('Signature verification test failed');
        return;
    }
    
    console.log('Decoding test passed');
    console.log('Signature verification test passed');
    
    // Test with invalid signature
    console.log('Testing invalid signature...');
    
    // Modify the token to invalidate the signature
    const parts = encodedToken.split('.');
    const invalidToken = parts[0] + '.' + parts[1] + '.' + parts[2].replace(/[A-Za-z0-9]/g, (c) => {
        return String.fromCharCode(c.charCodeAt(0) ^ 1); // Flip some bits
    });
    
    // Set input value
    jwtInput.value = invalidToken;
    
    // Decode JWT
    await decodeJWT();
    
    // Check if signature verification message indicates invalid signature
    if (!signatureOutput.value.includes('無効な署名です')) {
        console.error('Invalid signature test failed');
        return;
    }
    
    console.log('Invalid signature test passed');
    console.log('All tests passed!');
}

// Run the test
// Note: This should be called manually in the browser console after the page is loaded
// testJWTFunctionality();