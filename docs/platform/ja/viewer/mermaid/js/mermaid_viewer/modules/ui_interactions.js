// js/mermaid_viewer/modules/ui_interactions.js
import { setUploadedFileName, activeTabIndex, renameTab } from './state.js';

/**
 * Shows a temporary notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('info', 'success', 'warning', 'error')
 * @param {number} duration - How long to show the notification in milliseconds
 */
export function showNotification(message, type = 'info', duration = 3000) {
    // Check if notification container exists, create if not
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, duration);
}

// SVG Icon definitions
const SVG_ICON_CHEVRON_UP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6 1.41-1.41z"/></svg>';
const SVG_ICON_CHEVRON_DOWN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>';
const SVG_ICON_FULLSCREEN = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';
const SVG_ICON_FULLSCREEN_EXIT = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>';
const SVG_ICON_COPY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
const SVG_ICON_COPY_SUCCESS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
const SVG_ICON_TRASH = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
const SVG_ICON_PASTE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/></svg>';
const SVG_ICON_PASTE_SUCCESS = SVG_ICON_COPY_SUCCESS;
const SVG_ICON_DOWNLOAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
const SVG_ICON_DOWNLOAD_SUCCESS = SVG_ICON_COPY_SUCCESS;
const SVG_ICON_PREV_TAB = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
const SVG_ICON_NEXT_TAB = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
const SVG_ICON_RENDER = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>';


export function setupAllPanelsToggle(buttonElement, settingsPanelElement, codePanelElement) {
    if (!buttonElement || !settingsPanelElement || !codePanelElement) {
        console.warn("One or more elements for panel toggle not found.");
        return;
    }
    buttonElement.addEventListener('click', function() {
        const SPHidden = settingsPanelElement.classList.contains('hidden');
        const CPHidden = codePanelElement.classList.contains('hidden');
        if (SPHidden || CPHidden) {
            settingsPanelElement.classList.remove('hidden');
            codePanelElement.classList.remove('hidden');
            this.innerHTML = SVG_ICON_CHEVRON_UP;
            this.title = 'パネルを隠す';
        } else {
            settingsPanelElement.classList.add('hidden');
            codePanelElement.classList.add('hidden');
            this.innerHTML = SVG_ICON_CHEVRON_DOWN;
            this.title = 'パネルを表示';
        }
    });
    const arePanelsInitiallyHidden = settingsPanelElement.classList.contains('hidden') && codePanelElement.classList.contains('hidden');
    buttonElement.innerHTML = arePanelsInitiallyHidden ? SVG_ICON_CHEVRON_DOWN : SVG_ICON_CHEVRON_UP;
    buttonElement.title = arePanelsInitiallyHidden ? 'パネルを表示' : 'パネルを隠す';
}

export function setupFullscreenToggle(buttonElement, bodyElement) {
    if (!buttonElement || !bodyElement) {
        console.warn("Button element or body element for fullscreen toggle not found.");
        return;
    }
    function updateFullscreenButtonState(isFullscreenActive) {
        buttonElement.innerHTML = isFullscreenActive ? SVG_ICON_FULLSCREEN_EXIT : SVG_ICON_FULLSCREEN;
        buttonElement.title = isFullscreenActive ? '通常表示に戻す' : '全画面表示 (ビュー)';
    }
    updateFullscreenButtonState(bodyElement.classList.contains('graph-view-fullscreen'));
    buttonElement.addEventListener('click', function() {
        bodyElement.classList.toggle('graph-view-fullscreen');
        updateFullscreenButtonState(bodyElement.classList.contains('graph-view-fullscreen'));
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && bodyElement.classList.contains('graph-view-fullscreen')) {
            bodyElement.classList.remove('graph-view-fullscreen');
            updateFullscreenButtonState(false);
        }
    });
}

export function setupClearCodeButton(clearButton, codeInputElement, afterClearCallback) {
    if (!clearButton || !codeInputElement) {
        console.warn("Clear button or code input not found for setup.");
        return;
    }
    clearButton.innerHTML = SVG_ICON_TRASH;
    clearButton.title = "コードをクリア";
    clearButton.addEventListener('click', () => {
        codeInputElement.value = '';
        codeInputElement.focus();
        if (typeof afterClearCallback === 'function') {
            afterClearCallback();
        }
    });
}

export function setupCopyCodeButton(copyButton, codeInputElement) {
    if (!copyButton || !codeInputElement) {
        console.warn("Copy button or code input not found for setup.");
        return;
    }
    copyButton.innerHTML = SVG_ICON_COPY;
    const originalCopyTitle = "コードをコピー";
    copyButton.title = originalCopyTitle;

    copyButton.addEventListener('click', () => {
        if (codeInputElement.value.trim() === '') {
            copyButton.title = 'コピーするコードがありません';
            setTimeout(() => {
                copyButton.title = originalCopyTitle;
            }, 1500);
            return;
        }

        const currentTitle = copyButton.title; // Save current title before changing to success/failure
        if (!navigator.clipboard) {
            try {
                codeInputElement.select();
                document.execCommand('copy');
                copyButton.innerHTML = SVG_ICON_COPY_SUCCESS;
                copyButton.title = 'コピーしました!';
            } catch (err) {
                console.error('Fallback copy failed:', err);
                alert('コードのコピーに失敗しました (execCommand)。');
                copyButton.title = 'コピー失敗';
            }
        } else {
            navigator.clipboard.writeText(codeInputElement.value).then(() => {
                copyButton.innerHTML = SVG_ICON_COPY_SUCCESS;
                copyButton.title = 'コピーしました!';
            }).catch(err => {
                console.error('Async copy failed:', err);
                alert('コードのコピーに失敗しました (Clipboard API)。');
                copyButton.title = 'コピー失敗';
            });
        }
        setTimeout(() => {
            copyButton.innerHTML = SVG_ICON_COPY;
            copyButton.title = originalCopyTitle; // Restore original title consistently
        }, 2000);
    });
}

export function setupPasteCodeButton(pasteButton, codeInputElement, afterPasteCallback) {
    if (!pasteButton || !codeInputElement) {
        console.warn("Paste button or code input not found for setup.");
        return;
    }
    pasteButton.innerHTML = SVG_ICON_PASTE;
    const originalPasteTitle = "コードをペースト (既存の内容はクリアされます)";
    pasteButton.title = originalPasteTitle;

    pasteButton.addEventListener('click', async () => {
        if (!navigator.clipboard || !navigator.clipboard.readText) {
            alert('このブラウザではクリップボードの読み取りがサポートされていません。');
            pasteButton.title = 'ペースト失敗';
            setTimeout(() => { pasteButton.title = originalPasteTitle; }, 2000);
            return;
        }
        
        // Store the original content to check if it changes
        const originalContent = codeInputElement.value;
        
        try {
            const text = await navigator.clipboard.readText();
            codeInputElement.value = text; // Replace current content
            codeInputElement.focus();

            pasteButton.innerHTML = SVG_ICON_PASTE_SUCCESS;
            pasteButton.title = 'ペーストしました!';
            
            // Call the callback if the content has changed
            if (typeof afterPasteCallback === 'function' && originalContent !== codeInputElement.value) {
                afterPasteCallback();
            }
        } catch (err) {
            console.error('Paste failed:', err);
            if (err.name === 'NotAllowedError' || (err.message && err.message.toLowerCase().includes('permission denied'))) {
                alert('クリップボードへのアクセス許可が必要です。ページをクリックしてから再度お試しください。');
            } else {
                alert('クリップボードからのペーストに失敗しました。');
            }
            pasteButton.title = 'ペースト失敗';
            
            // Call the callback if the content has changed, even if there was an error
            if (typeof afterPasteCallback === 'function' && originalContent !== codeInputElement.value) {
                afterPasteCallback();
            }
        }
        setTimeout(() => {
            pasteButton.innerHTML = SVG_ICON_PASTE;
            pasteButton.title = originalPasteTitle;
        }, 2000);
    });
}

export function setupDownloadButton(downloadButton) {
    if (!downloadButton) {
        console.warn("Download button not found for setup.");
        return;
    }
    
    downloadButton.innerHTML = SVG_ICON_DOWNLOAD;
    downloadButton.title = "グラフをダウンロード";
}

export function setupDownloadCodeButton(downloadCodeButton, codeInputElement) {
    if (!downloadCodeButton || !codeInputElement) {
        console.warn("Download code button or code input not found for setup.");
        return;
    }
    
    downloadCodeButton.innerHTML = SVG_ICON_DOWNLOAD;
    downloadCodeButton.title = "コードをダウンロード";
    
    downloadCodeButton.addEventListener('click', () => {
        if (codeInputElement.value.trim() === '') {
            downloadCodeButton.title = 'ダウンロードするコードがありません';
            setTimeout(() => {
                downloadCodeButton.title = "コードをダウンロード";
            }, 1500);
            return;
        }
        
        try {
            // Import is done dynamically to avoid circular dependencies
            import('./download_utils.js').then(module => {
                module.downloadCode(codeInputElement.value);
                downloadCodeButton.innerHTML = SVG_ICON_DOWNLOAD_SUCCESS;
                downloadCodeButton.title = 'ダウンロードしました!';
                setTimeout(() => {
                    downloadCodeButton.innerHTML = SVG_ICON_DOWNLOAD;
                    downloadCodeButton.title = "コードをダウンロード";
                }, 2000);
            });
        } catch (err) {
            console.error('Code download failed:', err);
            alert('コードのダウンロードに失敗しました。');
            downloadCodeButton.title = 'ダウンロード失敗';
            setTimeout(() => {
                downloadCodeButton.title = "コードをダウンロード";
            }, 2000);
        }
    });
}

/**
 * Sets up the previous tab button functionality
 * @param {HTMLElement} prevTabButton - The previous tab button element
 */
export function setupPrevTabButton(prevTabButton) {
    if (!prevTabButton) {
        console.warn("Previous tab button not found for setup.");
        return;
    }
    
    // Set the button's icon and title
    prevTabButton.innerHTML = SVG_ICON_PREV_TAB;
    prevTabButton.title = "前のタブへ移動";
    
    // Initially hide the button (it will only be shown in fullscreen mode via CSS)
    prevTabButton.style.display = 'none';
    
    prevTabButton.addEventListener('click', async () => {
        try {
            // Import tab_manager.js dynamically to avoid circular dependencies
            const tabManager = await import('./tab_manager.js');
            const state = await import('./state.js');
            
            // Calculate the previous tab index (cycle to the last tab if at the first tab)
            const currentIndex = state.activeTabIndex;
            const prevIndex = (currentIndex - 1 + state.tabs.length) % state.tabs.length;
            
            // Switch to the previous tab
            tabManager.switchTab(prevIndex);
            
            // Show a brief success indicator
            prevTabButton.title = `タブ ${prevIndex + 1} に移動しました`;
            setTimeout(() => {
                prevTabButton.title = "前のタブへ移動";
            }, 1500);
        } catch (err) {
            console.error('Previous tab navigation failed:', err);
            prevTabButton.title = '前のタブへの移動に失敗しました';
            setTimeout(() => {
                prevTabButton.title = "前のタブへ移動";
            }, 1500);
        }
    });
}

/**
 * Sets up the next tab button functionality
 * @param {HTMLElement} nextTabButton - The next tab button element
 */
export function setupNextTabButton(nextTabButton) {
    if (!nextTabButton) {
        console.warn("Next tab button not found for setup.");
        return;
    }
    
    // Set the button's icon and title
    nextTabButton.innerHTML = SVG_ICON_NEXT_TAB;
    nextTabButton.title = "次のタブへ移動";
    
    // Initially hide the button (it will only be shown in fullscreen mode via CSS)
    nextTabButton.style.display = 'none';
    
    nextTabButton.addEventListener('click', async () => {
        try {
            // Import tab_manager.js dynamically to avoid circular dependencies
            const tabManager = await import('./tab_manager.js');
            const state = await import('./state.js');
            
            // Calculate the next tab index (cycle back to 0 if at the last tab)
            const currentIndex = state.activeTabIndex;
            const nextIndex = (currentIndex + 1) % state.tabs.length;
            
            // Switch to the next tab
            tabManager.switchTab(nextIndex);
            
            // Show a brief success indicator
            nextTabButton.title = `タブ ${nextIndex + 1} に移動しました`;
            setTimeout(() => {
                nextTabButton.title = "次のタブへ移動";
            }, 1500);
        } catch (err) {
            console.error('Next tab navigation failed:', err);
            nextTabButton.title = '次のタブへの移動に失敗しました';
            setTimeout(() => {
                nextTabButton.title = "次のタブへ移動";
            }, 1500);
        }
    });
}

/**
 * Sets up the render button functionality
 * @param {HTMLElement} renderButton - The render button element
 * @param {Function} renderGraphCallback - The function to call when the button is clicked
 */
export function setupRenderButton(renderButton, renderGraphCallback) {
    if (!renderButton) {
        console.warn("Render button not found for setup.");
        return;
    }
    
    // Set the button's icon and title
    renderButton.innerHTML = SVG_ICON_RENDER;
    renderButton.title = "グラフを描画";
    
    renderButton.addEventListener('click', () => {
        if (typeof renderGraphCallback === 'function') {
            // Show a brief loading indicator
            renderButton.title = "描画中...";
            
            // Call the render function
            renderGraphCallback();
            
            // Show a brief success indicator
            setTimeout(() => {
                renderButton.title = "描画完了";
                
                // Reset the title after a delay
                setTimeout(() => {
                    renderButton.title = "グラフを描画";
                }, 1500);
            }, 500);
        }
    });
}

export function setupClearFileButton(clearFileButton, fileInputElement, afterClearCallback) {
    if (!clearFileButton || !fileInputElement) {
        console.warn("Clear file button or file input not found for setup.");
        return;
    }
    
    clearFileButton.innerHTML = SVG_ICON_TRASH;
    clearFileButton.title = "アップロードファイル情報をクリア";
    
    clearFileButton.addEventListener('click', () => {
        // Clear the file input by resetting its value
        fileInputElement.value = '';
        
        // Clear the uploaded filename state
        setUploadedFileName(null);
        
        if (typeof afterClearCallback === 'function') {
            afterClearCallback();
        }
    });
}

export function setupFileUpload(fileInputElement, afterUploadCallback) {
    if (!fileInputElement) {
        console.warn("File input not found for setup.");
        return;
    }

    fileInputElement.addEventListener('change', (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        // Process each file in the selection
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            handleFileUpload(file, afterUploadCallback);
        }
        
        // Show notification if multiple files were uploaded
        if (files.length > 1) {
            showNotification(`${files.length}個のファイルをアップロードしました。`, 'success');
        }
    });
}

/**
 * Helper function to handle file upload (used by both file input and drag & drop)
 * 
 * This function processes uploaded files, with special handling for Markdown files:
 * - For Markdown files: Extracts code blocks and creates a tab for each block
 * - For regular files: Detects the language and updates the active tab
 * 
 * @param {File} file - The uploaded file
 * @param {Function} afterUploadCallback - Callback function to call after processing
 */
function handleFileUpload(file, afterUploadCallback) {
    // Store the original filename for later use in downloads
    setUploadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
        const content = e.target.result;

        try {
            // Check if the file is a Markdown file
            const { isMarkdownFile, parseMarkdown, generateTabTitle } = await import('./markdown_parser.js');
            
            if (isMarkdownFile(file)) {
                // ===== MARKDOWN FILE PROCESSING =====
                console.log(`Processing Markdown file: ${file.name}`);
                
                // Extract code blocks from the Markdown content
                const codeBlocks = parseMarkdown(content);
                
                // Handle case where no code blocks are found
                if (codeBlocks.length === 0) {
                    showNotification('Markdownファイルにコードブロックが見つかりませんでした。', 'warning');
                    return;
                }
                
                // Import tab management functions
                const { addTab, updateActiveTabContent, updateActiveTabNotation, switchTab } = await import('./tab_manager.js');
                
                // Create a tab for each code block found in the Markdown
                let firstTabIndex = null;
                
                for (let i = 0; i < codeBlocks.length; i++) {
                    const block = codeBlocks[i];
                    
                    // Generate a meaningful tab title based on file name and language
                    const tabTitle = generateTabTitle(file.name, block.language, i);
                    console.log(`Creating tab: ${tabTitle}`);
                    
                    // Create a new tab and get its index
                    const tabIndex = addTab(tabTitle);
                    
                    // Remember the first tab's index so we can switch back to it later
                    if (i === 0) {
                        firstTabIndex = tabIndex;
                    }
                    
                    // Set the tab's content and notation (language)
                    updateActiveTabContent(block.content);
                    updateActiveTabNotation(block.notation);
                    
                    // Update the radio button to match the notation
                    const radioButtons = document.getElementsByName('notation');
                    for (const radio of radioButtons) {
                        if (radio.value === block.notation) {
                            radio.checked = true;
                        }
                    }
                    
                    // For code blocks without explicit language, try to detect it
                    if (!block.language) {
                        try {
                            const { detectLanguage } = await import('./language_detector.js');
                            const detectedLanguage = detectLanguage(block.content);
                            updateActiveTabNotation(detectedLanguage);
                            
                            // Update the radio button to match the detected language
                            for (const radio of radioButtons) {
                                if (radio.value === detectedLanguage) {
                                    radio.checked = true;
                                }
                            }
                        } catch (error) {
                            console.warn('言語の自動検出に失敗しました:', error);
                        }
                    }
                }
                
                // Switch back to the first tab after creating all tabs
                if (firstTabIndex !== null) {
                    switchTab(firstTabIndex);
                }
                
                // Show success notification with the number of code blocks extracted
                showNotification(`Markdownファイルから${codeBlocks.length}個のコードブロックを抽出しました。`, 'success');
                
                // Call the callback with the first code block's content
                if (typeof afterUploadCallback === 'function') {
                    afterUploadCallback(file, codeBlocks[0].content);
                }
            } else {
                // ===== REGULAR FILE PROCESSING =====
                console.log(`Processing regular file: ${file.name}`);
                
                // Import tab management functions
                const { addTab, updateActiveTabContent, updateActiveTabNotation, switchTab } = await import('./tab_manager.js');
                
                // Get the file name without extension to use as tab title
                const baseName = file.name.replace(/\.[^/.]+$/, '');
                
                // Create a new tab with the file name as the title
                const newTabIndex = addTab(baseName);
                
                // Update the new tab's content
                updateActiveTabContent(content);
                
                // Auto-detect language and set the appropriate radio button
                try {
                    // Import is done dynamically to avoid circular dependencies
                    const { detectLanguage } = await import('./language_detector.js');
                    const detectedLanguage = detectLanguage(content);
                    
                    // Update the tab's notation
                    updateActiveTabNotation(detectedLanguage);
                    
                    // Set the appropriate radio button
                    const radioButtons = document.getElementsByName('notation');
                    let previouslySelected = null;
                    
                    for (const radio of radioButtons) {
                        if (radio.checked) {
                            previouslySelected = radio.value;
                        }
                        if (radio.value === detectedLanguage) {
                            radio.checked = true;
                        }
                    }
                    
                    // Show notification only if the selection changed
                    if (previouslySelected !== detectedLanguage) {
                        const languageName = detectedLanguage === 'dot' ? 'DOT' : 'Mermaid';
                        showNotification(`言語を自動検出しました: ${languageName}`, 'success');
                        console.log(`言語を自動検出しました: ${languageName}`);
                    }
                } catch (error) {
                    console.warn('言語の自動検出に失敗しました:', error);
                    // Continue with the current selection if detection fails
                }

                // Call the callback with the file content
                if (typeof afterUploadCallback === 'function') {
                    afterUploadCallback(file, content);
                }
            }
        } catch (error) {
            // Handle any errors that occur during file processing
            console.error('ファイル処理中にエラーが発生しました:', error);
            showNotification('ファイル処理中にエラーが発生しました。', 'error');
        }
    };
    
    // Handle file reading errors
    reader.onerror = (e) => {
        console.error('File reading failed:', e);
        alert('ファイルの読み込みに失敗しました。');
    };
    
    // Start reading the file as text
    reader.readAsText(file);
}



export function setupDragAndDrop(codeInputElement, afterUploadCallback) {
    if (!codeInputElement) {
        console.warn("Code input not found for drag and drop setup.");
        return;
    }

    // Prevent default behavior to allow drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        codeInputElement.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Add visual feedback when dragging files over the textarea
    ['dragenter', 'dragover'].forEach(eventName => {
        codeInputElement.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        codeInputElement.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        codeInputElement.classList.add('drag-over');
    }

    function unhighlight() {
        codeInputElement.classList.remove('drag-over');
    }

    // Handle the dropped files
    codeInputElement.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files && files.length > 0) {
            // Process each file in the drop
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                handleFileUpload(file, afterUploadCallback);
            }
            
            // Show notification if multiple files were dropped
            if (files.length > 1) {
                showNotification(`${files.length}個のファイルをアップロードしました。`, 'success');
            }
        }
    }
}