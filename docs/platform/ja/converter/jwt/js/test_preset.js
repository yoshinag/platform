// Test script for JWT preset secret key functionality
// This can be run in the browser console after loading the JWT page

function testPresetSecretKey() {
    console.log('Testing preset secret key functionality...');

    // Check if the secret key field is preset on page load
    console.log('Secret key value on page load:', secretInput.value);
    if (secretInput.value !== 'your-256-bit-secret') {
        console.error('Preset secret key test failed: Secret key not preset on page load');
        return;
    }

    console.log('Preset secret key test passed: Secret key is preset on page load');

    // Test clearing the form
    console.log('Testing clear functionality...');

    // Change the secret key value
    secretInput.value = 'different-secret';

    // Clear the form
    clearEncode();

    // Check if the secret key field is reset to the preset value
    console.log('Secret key value after clearing:', secretInput.value);
    if (secretInput.value !== 'your-256-bit-secret') {
        console.error('Clear functionality test failed: Secret key not reset to preset value');
        return;
    }

    console.log('Clear functionality test passed: Secret key is reset to preset value');

    // Test encoding with the preset secret key
    console.log('Testing encoding with preset secret key...');

    // Set input values
    const testHeader = {
        "alg": "HS256",
        "typ": "JWT"
    };
    const testPayload = {
        "sub": "1234567890",
        "name": "テストユーザー",
        "iat": 1516239022
    };

    headerInput.value = JSON.stringify(testHeader, null, 2);
    payloadInput.value = JSON.stringify(testPayload, null, 2);
    // Secret key is already preset

    // Encode JWT
    encodeJWT().then(() => {
        // Get the encoded token
        const encodedToken = tokenOutput.value;
        console.log('Encoded JWT:', encodedToken);

        if (!encodedToken || encodedToken.split('.').length !== 3) {
            console.error('Encoding test failed: Invalid token format');
            return;
        }

        console.log('Encoding test passed: Token successfully created with preset secret key');

        // Test decoding with the preset secret key
        console.log('Testing decoding with preset secret key...');

        // Set input value
        jwtInput.value = encodedToken;

        // Decode JWT
        decodeJWT().then(() => {
            // Check if signature verification message is present
            if (!signatureOutput.value.includes('有効な署名です')) {
                console.error('Signature verification test failed: Signature not verified with preset secret key');
                return;
            }

            console.log('Decoding test passed: Signature successfully verified with preset secret key');
            console.log('All tests passed!');
        }).catch(error => {
            console.error('Decoding test failed:', error);
        });
    }).catch(error => {
        console.error('Encoding test failed:', error);
    });
}

// Run the test
// Note: This should be called manually in the browser console after the page is loaded
// testPresetSecretKey();