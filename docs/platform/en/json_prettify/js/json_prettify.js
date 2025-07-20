// SVG Icon definitions
const SVG_ICON_COPY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
const SVG_ICON_COPY_SUCCESS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
const SVG_ICON_TRASH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
const SVG_ICON_PASTE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16zM12 6H9v2h3V6zm0 3H9v2h3V9zm0 3H9v2h3v-2z"/></svg>';
const SVG_ICON_PASTE_SUCCESS = SVG_ICON_COPY_SUCCESS;

const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
const copyInputBtn = document.getElementById('copy-input-btn');
const pasteInputBtn = document.getElementById('paste-input-btn');
const clearInputBtn = document.getElementById('clear-input-btn');
const copyOutputBtn = document.getElementById('copy-output-btn');
const pasteOutputBtn = document.getElementById('paste-output-btn');
const clearOutputBtn = document.getElementById('clear-output-btn');

function formatJSON(){
    const inputText = jsonInput.value;
    try{
        const parsedJson = JSON.parse(inputText);
        jsonOutput.textContent = JSON.stringify(parsedJson, null, 2);
    }
    catch(e){
        jsonOutput.textContent = "Invalid JSON format.\n" + e;
    }
}

function minifyJSON(){
    const outputText = jsonOutput.textContent;
    try{
        const parsedJson = JSON.parse(outputText);
        jsonInput.value = JSON.stringify(parsedJson);
    }
    catch(e){
        jsonInput.value = "Invalid formatted JSON.\n" + e;
    }
}

// Setup copy button for input
function setupCopyButton(copyButton, element, isTextarea = true) {
    if (!copyButton || !element) return;

    copyButton.innerHTML = SVG_ICON_COPY;
    const originalTitle = copyButton.title;

    copyButton.addEventListener('click', () => {
        const textToCopy = isTextarea ? element.value : element.textContent;

        if (textToCopy.trim() === '') {
            copyButton.title = isTextarea ? 'Input is empty' : 'Output is empty';
            setTimeout(() => {
                copyButton.title = originalTitle;
            }, 1500);
            return;
        }

        if (!navigator.clipboard) {
            try {
                if (isTextarea) {
                    element.select();
                } else {
                    const range = document.createRange();
                    range.selectNodeContents(element);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
                document.execCommand('copy');
                copyButton.innerHTML = SVG_ICON_COPY_SUCCESS;
                copyButton.title = 'Copied!';
            } catch (err) {
                console.error('Fallback copy failed:', err);
                alert('Copy failed (execCommand).');
                copyButton.title = 'Copy failed';
            }
        } else {
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyButton.innerHTML = SVG_ICON_COPY_SUCCESS;
                copyButton.title = 'Copied!';
            }).catch(err => {
                console.error('Async copy failed:', err);
                alert('Copy failed (Clipboard API).');
                copyButton.title = 'Copy failed';
            });
        }

        setTimeout(() => {
            copyButton.innerHTML = SVG_ICON_COPY;
            copyButton.title = originalTitle;
        }, 2000);
    });
}

// Setup paste button for input
function setupPasteButton(pasteButton, element, isTextarea = true, afterPasteCallback = null) {
    if (!pasteButton || !element) return;

    pasteButton.innerHTML = SVG_ICON_PASTE;
    const originalTitle = pasteButton.title;

    pasteButton.addEventListener('click', async () => {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            alert('Clipboard reading is not supported in this browser.');
            pasteButton.title = 'Paste failed';
            setTimeout(() => { pasteButton.title = originalTitle; }, 2000);
            return;
        }

        try {
            const text = await navigator.clipboard.readText();
            if (isTextarea) {
                element.value = text;
            } else {
                element.textContent = text;
            }

            pasteButton.innerHTML = SVG_ICON_PASTE_SUCCESS;
            pasteButton.title = 'Pasted!';

            if (typeof afterPasteCallback === 'function') {
                afterPasteCallback();
            }
        } catch (err) {
            console.error('Paste failed:', err);
            if (err.name === 'NotAllowedError' || (err.message && err.message.toLowerCase().includes('permission denied'))) {
                alert('Clipboard access permission is required. Please click on the page and try again.');
            } else {
                alert('Failed to paste from clipboard.');
            }
            pasteButton.title = 'Paste failed';
        }

        setTimeout(() => {
            pasteButton.innerHTML = SVG_ICON_PASTE;
            pasteButton.title = originalTitle;
        }, 2000);
    });
}

// Setup clear button
function setupClearButton(clearButton, element, isTextarea = true, afterClearCallback = null) {
    if (!clearButton || !element) return;

    clearButton.innerHTML = SVG_ICON_TRASH;

    clearButton.addEventListener('click', () => {
        if (isTextarea) {
            element.value = '';
            element.focus();
        } else {
            element.textContent = 'Formatted JSON will be displayed here';
        }

        if (typeof afterClearCallback === 'function') {
            afterClearCallback();
        }
    });
}

// Initialize buttons when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Setup input buttons
    setupCopyButton(copyInputBtn, jsonInput);
    setupPasteButton(pasteInputBtn, jsonInput, true, formatJSON);
    setupClearButton(clearInputBtn, jsonInput);

    // Setup output buttons
    setupCopyButton(copyOutputBtn, jsonOutput, false);
    setupPasteButton(pasteOutputBtn, jsonOutput, false);
    setupClearButton(clearOutputBtn, jsonOutput, false);
});
