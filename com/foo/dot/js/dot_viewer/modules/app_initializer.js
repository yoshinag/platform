/**
 * app_initializer.js - アプリケーション初期化モジュール
 * 
 * このモジュールは、dot_viewerアプリケーションの初期化を担当します。
 * 主な責務:
 * - テンプレートの読み込みと設定
 * - UIコンポーネントの初期化とイベントリスナーの設定
 * - 外部ライブラリ（Viz.js、Mermaid.js）の初期化
 * - 初期グラフの描画
 */
import {
    templateSelect, codeInput, notationRadios, toggleAllPanelsBtn, settingsPanel,
    codePanel, toggleFullscreenBtn, bodyElement, clearCodeBtn, copyCodeBtn, pasteCodeBtn, // Added pasteCodeBtn
    graphContainer
} from './dom_elements.js';
import * as state from './state.js';
import { initializeVizInstance, initializeMermaid, renderGraph } from './graph_renderer.js';
import { getSelectedNotation } from './graph_utils.js';
import { setupCoreEventListeners } from './event_handlers.js';

import { loadTemplatesFromFile, populateTemplateSelectWithOptions, applyTemplateToUI } from './template_manager.js';
import {
    setupAllPanelsToggle, setupFullscreenToggle, setupClearCodeButton,
    setupCopyCodeButton, setupPasteCodeButton
} from './ui_interactions.js';


export async function initializeApp() {
    try {
        const templates = await loadTemplatesFromFile('js/dot_viewer/templates.json');
        state.setAllTemplates(templates);
        populateTemplateSelectWithOptions(templateSelect, state.allTemplates);

        if (toggleAllPanelsBtn && settingsPanel && codePanel) setupAllPanelsToggle(toggleAllPanelsBtn, settingsPanel, codePanel);
        if (toggleFullscreenBtn && bodyElement) setupFullscreenToggle(toggleFullscreenBtn, bodyElement);
        // CDN panel toggle setup removed as we're now using static script tags

        // Code action buttons
        if (clearCodeBtn && codeInput) setupClearCodeButton(clearCodeBtn, codeInput, renderGraph);
        if (copyCodeBtn && codeInput) setupCopyCodeButton(copyCodeBtn, codeInput);
        if (pasteCodeBtn && codeInput) setupPasteCodeButton(pasteCodeBtn, codeInput, renderGraph); // Added

        setupCoreEventListeners();

        if (state.allTemplates.length > 0 && templateSelect.value) {
            applyTemplateToUI(templateSelect.value, state.allTemplates, codeInput, notationRadios);
        }

        // Initialize mermaid.js (now loaded via static script tag)
        initializeMermaid();

        if (getSelectedNotation() === 'dot') {
            initializeVizInstance();
        }

        if (codeInput.value.trim()) {
            await renderGraph();
        } else if (state.allTemplates.length === 0) {
            graphContainer.innerHTML = '<p>テンプレート無し。コードを直接入力してください。</p>';
        } else {
            graphContainer.innerHTML = '<p>記法を選択し、有効なコードを入力するか、テンプレートを選択してください。</p>';
        }

    } catch (error) {
        console.error("アプリケーション初期化失敗:", error);
        if (graphContainer) {
            graphContainer.innerHTML = `<p class="error-message">アプリケーションの初期化に失敗しました。<br>${error.message || '詳細不明'}</p>`;
        }
    }
}
