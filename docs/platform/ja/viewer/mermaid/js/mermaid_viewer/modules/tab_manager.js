// js/mermaid_viewer/modules/tab_manager.js
import { tabButtons, tabContent, codeInput, notationRadios } from './dom_elements.js';
import * as state from './state.js';
import { renderGraph } from './graph_renderer.js';
import { showNotification } from './ui_interactions.js';
import { detectLanguage } from './language_detector.js';

/**
 * Initializes the tab system
 */
export function initializeTabs() {
    renderTabs();
    syncCodeInputWithActiveTab();
}

/**
 * Renders all tabs based on the current state
 */
export function renderTabs() {
    if (!tabButtons) return;
    
    // Clear existing tabs
    tabButtons.innerHTML = '';
    
    // Create tab buttons
    state.tabs.forEach((tab, index) => {
        const tabButton = document.createElement('button');
        tabButton.className = `tab-button ${index === state.activeTabIndex ? 'active' : ''}`;
        tabButton.dataset.tabIndex = index;
        
        const tabText = document.createElement('span');
        tabText.className = 'tab-button-text';
        tabText.textContent = tab.title;
        tabButton.appendChild(tabText);
        
        // Only add close button if there's more than one tab
        if (state.tabs.length > 1) {
            const closeBtn = document.createElement('span');
            closeBtn.className = 'tab-close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.dataset.tabIndex = index;
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent tab switching when clicking close
                closeTab(index);
            });
            tabButton.appendChild(closeBtn);
        }
        
        tabButton.addEventListener('click', () => switchTab(index));
        tabButtons.appendChild(tabButton);
    });
}

/**
 * Switches to the specified tab
 * @param {number} index - The index of the tab to switch to
 */
export function switchTab(index) {
    if (index === state.activeTabIndex) return;
    
    // Save current tab content
    saveActiveTabContent();
    
    // Switch to new tab
    if (state.setActiveTabIndex(index)) {
        renderTabs();
        syncCodeInputWithActiveTab();
        renderGraph();
    }
}

/**
 * Adds a new tab
 * @param {string} title - Optional title for the new tab
 */
export function addTab(title = null) {
    // Save current tab content
    saveActiveTabContent();
    
    // Add new tab and switch to it
    const newIndex = state.addTab(title);
    state.setActiveTabIndex(newIndex);
    
    renderTabs();
    syncCodeInputWithActiveTab();
    
    showNotification('新しいタブを追加しました', 'success');
}

/**
 * Closes the specified tab
 * @param {number} index - The index of the tab to close
 */
export function closeTab(index) {
    // Don't close the last tab
    if (state.tabs.length <= 1) {
        showNotification('最後のタブは閉じることができません', 'warning');
        return;
    }
    
    // Save current tab content before closing any tab
    saveActiveTabContent();
    
    // Close the tab
    if (state.removeTab(index)) {
        renderTabs();
        syncCodeInputWithActiveTab();
        renderGraph();
        
        showNotification('タブを閉じました', 'info');
    }
}

/**
 * Saves the current content of the code input to the active tab
 */
export function saveActiveTabContent() {
    if (codeInput) {
        state.setActiveTabContent(codeInput.value);
    }
}

/**
 * Updates the code input with the content of the active tab
 * Also detects the language of the content and updates the UI accordingly
 * Then renders the graph
 */
export function syncCodeInputWithActiveTab() {
    if (codeInput) {
        const content = state.getActiveTabContent();
        codeInput.value = content || '';
        
        // Auto-detect language when tab becomes active
        if (content) {
            const currentNotation = state.getActiveTabNotation();
            const detectedLanguage = detectLanguage(content);
            
            // Only update if the detected language is different from the current notation
            if (detectedLanguage !== currentNotation) {
                // Update the active tab's notation
                state.setActiveTabNotation(detectedLanguage);
                
                // Update the radio buttons to reflect the detected language
                if (notationRadios) {
                    for (const radio of notationRadios) {
                        if (radio.value === detectedLanguage) {
                            radio.checked = true;
                        }
                    }
                }
                
                // Show notification about the auto-detection
                const languageName = detectedLanguage === 'dot' ? 'DOT' : 'Mermaid';
                showNotification(`タブがアクティブになり、言語を自動検出しました: ${languageName}`, 'info');
            }
        }
        
        // Render the graph immediately when a tab is activated
        renderGraph();
    }
}

/**
 * Updates the active tab's content and renders the graph
 * @param {string} content - The new content
 */
export function updateActiveTabContent(content) {
    state.setActiveTabContent(content);
    if (codeInput) {
        codeInput.value = content;
        // Render the graph immediately when content is updated
        renderGraph();
    }
}

/**
 * Updates the active tab's notation
 * @param {string} notation - The new notation ('dot' or 'mermaid')
 */
export function updateActiveTabNotation(notation) {
    state.setActiveTabNotation(notation);
}