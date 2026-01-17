// js/mermaid_viewer/modules/event_handlers.js
import {
    notationRadios, templateSelect, codeInput, downloadBtn,
    downloadFormatSelect, graphContainer, fileUpload, downloadCodeBtn,
    clearFileBtn, addTabBtn
} from './dom_elements.js';
import * as state from './state.js';
import {applyTemplateToUI} from './template_manager.js'; // Updated import
import {renderGraph} from './graph_renderer.js';
import {downloadSVG, downloadPNG, triggerDownload} from './download_utils.js'; // Updated import
import {
    setupFileUpload,
    setupDownloadButton,
    setupDownloadCodeButton,
    setupClearFileButton,
    setupDragAndDrop
} from './ui_interactions.js';
import {
    initializeTabs,
    saveActiveTabContent,
    updateActiveTabContent,
    updateActiveTabNotation,
    addTab
} from './tab_manager.js';

export function handleNotationChange(event) {
    const selectedNotation = event.target.value;

    // Update the active tab's notation
    updateActiveTabNotation(selectedNotation);

    const firstMatchingTemplate = state.allTemplates.find(t => t.notation === selectedNotation);
    let templateToApplyId = null;

    if (firstMatchingTemplate) {
        templateToApplyId = firstMatchingTemplate.id;
    } else if (state.allTemplates.length > 0) {
        templateToApplyId = state.allTemplates[0].id;
    }

    if (templateToApplyId) {
        templateSelect.value = templateToApplyId;
        applyTemplateToUI(templateToApplyId, state.allTemplates, codeInput, notationRadios);

        // Save the updated content to the active tab
        saveActiveTabContent();
    }
    renderGraph();
}

export function handleTemplateChange(event) {
    applyTemplateToUI(event.target.value, state.allTemplates, codeInput, notationRadios);

    // Save the updated content to the active tab
    saveActiveTabContent();

    renderGraph();
}

let debounceTimer;

export function handleCodeInputChange() {
    // Save the content to the active tab as it changes
    saveActiveTabContent();

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(renderGraph, 200);
}

export function handleDownload() {
    const format = downloadFormatSelect.value.toLowerCase();
    const svgElement = graphContainer.querySelector('svg');

    if (svgElement) {
        if (format === 'svg') downloadSVG(svgElement); // graphContainer no longer strictly needed
        else if (format === 'png') downloadPNG(svgElement); // graphContainer no longer strictly needed
        else alert('不明なグラフィックダウンロード形式です: ' + format);
    } else {
        const currentText = graphContainer.textContent || graphContainer.innerText;
        if (currentText && currentText.trim() !== '') {
            const blob = new Blob([currentText.trim()], {type: 'text/plain;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            triggerDownload(url, 'graph_content.txt');
        } else {
            alert('ダウンロード可能なコンテンツが graph container に見つかりません。');
        }
    }
}

export function setupCoreEventListeners() {
    // Initialize tabs
    initializeTabs();

    // Set up add tab button
    if (addTabBtn) {
        addTabBtn.addEventListener('click', () => addTab());
    }

    notationRadios.forEach(radio => radio.addEventListener('change', handleNotationChange));
    templateSelect.addEventListener('change', handleTemplateChange);
    codeInput.addEventListener('input', handleCodeInputChange);

    // Set up download buttons with icons
    if (downloadBtn) {
        setupDownloadButton(downloadBtn);
        downloadBtn.addEventListener('click', handleDownload);
    }

    // Set up code download button
    if (downloadCodeBtn && codeInput) {
        setupDownloadCodeButton(downloadCodeBtn, codeInput);
    }

    // Set up file upload with tab support
    if (fileUpload && codeInput) {
        setupFileUpload(fileUpload, (file, content) => {
            // Update the active tab with the uploaded content
            updateActiveTabContent(content);
            renderGraph();
        });
    }

    // Set up clear file button
    if (clearFileBtn && fileUpload) {
        setupClearFileButton(clearFileBtn, fileUpload, renderGraph);
    }


    // Set up drag and drop for code input with tab support
    if (codeInput) {
        setupDragAndDrop(codeInput, (file, content) => {
            // Update the active tab with the dropped content
            updateActiveTabContent(content);
            renderGraph();
        });
    }
}