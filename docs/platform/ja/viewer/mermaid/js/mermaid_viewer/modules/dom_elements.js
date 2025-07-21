// js/mermaid_viewer/modules/dom_elements.js
export const codeInput = document.getElementById('code-input');
export const graphContainer = document.getElementById('graph-container');
export const notationRadios = document.getElementsByName('notation');
export const templateSelect = document.getElementById('template-select');
export const downloadBtn = document.getElementById('download-btn');
export const downloadFormatSelect = document.getElementById('download-format-select');
export const downloadCodeBtn = document.getElementById('download-code-btn');
export const fileUpload = document.getElementById('file-upload');
export const clearFileBtn = document.getElementById('clear-file-btn');
export const toggleAllPanelsBtn = document.getElementById('toggle-all-panels-btn');
export const settingsPanel = document.querySelector('.settings-panel');
export const codePanel = document.querySelector('.code-panel');
export const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
export const prevTabBtn = document.getElementById('prev-tab-btn');
export const nextTabBtn = document.getElementById('next-tab-btn');
export const bodyElement = document.body;
export const clearCodeBtn = document.getElementById('clear-code-btn');
export const copyCodeBtn = document.getElementById('copy-code-btn');
export const pasteCodeBtn = document.getElementById('paste-code-btn');
export const renderBtn = document.getElementById('render-btn');
export const outputPanel = document.querySelector('.output-panel');

// Tab-related elements
export const tabsContainer = document.querySelector('.tabs-container');
export const tabButtons = document.querySelector('.tab-buttons');
export const tabContent = document.querySelector('.tab-content');
export const addTabBtn = document.getElementById('add-tab-btn');

if (!codeInput || !graphContainer || !templateSelect || !pasteCodeBtn || !downloadCodeBtn || !renderBtn) {
    console.error("One or more critical DOM elements are missing. Application might not work correctly.");
}

if (!tabsContainer || !tabButtons || !tabContent || !addTabBtn) {
    console.error("One or more tab-related DOM elements are missing. Tab functionality might not work correctly.");
}