// Test script for JWT encoding and decoding with Unicode characters
// This can be run in the browser console after loading the JWT page

async function testUnicodeSupport() {
    console.log('Starting Unicode support test...');
    
    // Test data with Japanese characters
    const testHeader = {
        "alg": "HS256",
        "typ": "JWT"
    };
    const testPayload = {
        "sub": "1234567890",
        "name": "山田太郎",
        "role": "管理者",
        "description": "これはテスト用のJWTトークンです。",
        "iat": 1516239022
    };
    const testSecret = "your-256-bit-secret";
    
    // Test encoding with Unicode characters
    console.log('Testing JWT encoding with Unicode characters...');
    
    // Set input values
    headerInput.value = JSON.stringify(testHeader, null, 2);
    payloadInput.value = JSON.stringify(testPayload, null, 2);
    secretInput.value = testSecret;
    
    try {
        // Encode JWT
        await encodeJWT();
        
        // Get the encoded token
        const encodedToken = tokenOutput.value;
        console.log('Encoded JWT:', encodedToken);
        
        if (!encodedToken || encodedToken.split('.').length !== 3) {
            console.error('Encoding test failed: Invalid token format');
            return;
        }
        
        console.log('Encoding test passed: Successfully encoded JWT with Unicode characters');
        
        // Test decoding with Unicode characters
        console.log('Testing JWT decoding with Unicode characters...');
        
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
            console.log('Expected:', JSON.stringify(testHeader));
            console.log('Got:', JSON.stringify(decodedHeader));
            return;
        }
        
        // Check if payload matches
        if (JSON.stringify(decodedPayload) !== JSON.stringify(testPayload)) {
            console.error('Decoding test failed: Payload mismatch');
            console.log('Expected:', JSON.stringify(testPayload));
            console.log('Got:', JSON.stringify(decodedPayload));
            return;
        }
        
        // Check if signature verification message is present
        if (!signatureOutput.value.includes('有効な署名です')) {
            console.error('Signature verification test failed');
            return;
        }
        
        console.log('Decoding test passed: Successfully decoded JWT with Unicode characters');
        console.log('Signature verification test passed');
        console.log('All tests passed!');
        
    } catch (error) {
        console.error('Test failed with error:', error);
    }
}

// Run the test
// Note: This should be called manually in the browser console after the page is loaded
// testUnicodeSupport();