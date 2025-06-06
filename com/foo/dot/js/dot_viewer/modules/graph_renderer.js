/**
 * graph_renderer.js - グラフ描画モジュール
 * 
 * このモジュールは、DOT言語とMermaid記法を使用したグラフの描画を担当します。
 * 主な責務:
 * - Viz.jsインスタンスの初期化と管理
 * - Mermaid.jsの初期化
 * - DOT言語とMermaid記法のグラフ描画処理
 * - エラー処理と表示
 */
import { graphContainer, codeInput } from './dom_elements.js';
import * as state from './state.js';
import { getSelectedNotation } from './graph_utils.js';

export function initializeVizInstance() {
    if (typeof Viz === 'undefined') {
        console.error("Viz.jsが読み込まれていません。");
        graphContainer.innerHTML = '<p class="error-message">Viz.jsの読み込みに失敗しました。</p>';
        return false;
    }
    try {
        const newVizInstance = new Viz();
        state.setVizInstance(newVizInstance);
        return true;
    } catch (e) {
        console.error("Viz.js の初期化に失敗:", e);
        graphContainer.innerHTML = '<p class="error-message">Viz.js の初期化に失敗しました。</p>';
        state.setVizInstance(null);
        return false;
    }
}

// Dynamic script loading functions removed as we're now using static script tags

export function initializeMermaid() {
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({ startOnLoad: false, theme: 'default' });
    } else {
        console.warn("Mermaid.jsが読み込まれていません。");
    }
}

export async function renderGraph() {
    const currentNotation = getSelectedNotation();
    const code = codeInput.value.trim();
    graphContainer.innerHTML = ''; // Clear previous content

    if (!code) {
        graphContainer.innerHTML = '<p>コードを入力してください。</p>';
        return;
    }
    graphContainer.innerHTML = `<p>描画中 (${currentNotation === 'dot' ? 'DOT' : 'Mermaid'})...</p>`;

    if (currentNotation === 'dot') {
        if (!state.vizInstance && !initializeVizInstance()) return;
        if (!state.vizInstance) {
            graphContainer.innerHTML = '<p class="error-message">Viz.jsが初期化されていません。</p>';
            return;
        }
        try {
            const element = await state.vizInstance.renderSVGElement(code);
            graphContainer.innerHTML = '';
            graphContainer.appendChild(element);
        } catch (error) {
            console.error('Viz.js Error:', error);
            graphContainer.innerHTML = `<p class="error-message">DOTグラフ描画失敗:<br>${error.message || error}</p>`;
        }
    } else if (currentNotation === 'mermaid') {
        if (typeof mermaid === 'undefined') {
            graphContainer.innerHTML = '<p class="error-message">Mermaid.js未ロード</p>';
            return;
        }
        try {
            const uniqueId = 'mermaid-graph-' + Date.now();
            graphContainer.innerHTML = '';
            const { svg, bindFunctions } = await mermaid.render(uniqueId, code);
            graphContainer.innerHTML = svg;
            if (bindFunctions) bindFunctions(graphContainer);
        } catch (error) {
            console.error('Mermaid.js Error:', error);
            let errMsg = error.message || error.str || (typeof error === 'object' ? JSON.stringify(error, null, 2) : String(error));
            graphContainer.innerHTML = `<p class="error-message">Mermaidグラフ描画失敗:<br>${errMsg}</p>`;
        }
    } else {
        graphContainer.innerHTML = '<p>対応記法未選択</p>';
    }
}
