/**
 * dom_elements.js - DOM要素参照モジュール
 * 
 * このモジュールは、アプリケーションで使用するDOM要素への参照を一元管理します。
 * 主な責務:
 * - 重要なDOM要素の参照を提供
 * - DOM要素の存在チェック
 * - コード整理と保守性の向上
 */
export const codeInput = document.getElementById('code-input');
export const graphContainer = document.getElementById('graph-container');
export const notationRadios = document.getElementsByName('notation');
export const templateSelect = document.getElementById('template-select');
export const downloadBtn = document.getElementById('download-btn');
export const downloadFormatSelect = document.getElementById('download-format-select');
// CDN input elements removed as we're now using static script tags
export const toggleAllPanelsBtn = document.getElementById('toggle-all-panels-btn');
export const settingsPanel = document.querySelector('.settings-panel');
export const codePanel = document.querySelector('.code-panel');
export const toggleFullscreenBtn = document.getElementById('toggle-fullscreen-btn');
export const bodyElement = document.body;
export const clearCodeBtn = document.getElementById('clear-code-btn');
export const copyCodeBtn = document.getElementById('copy-code-btn');
export const pasteCodeBtn = document.getElementById('paste-code-btn'); // Added
export const outputPanel = document.querySelector('.output-panel');
// CDN panel elements removed as we're now using static script tags

if (!codeInput || !graphContainer || !templateSelect || !pasteCodeBtn /* Added check */) {
    console.error("1つ以上の重要なDOM要素が見つかりません。アプリケーションが正しく動作しない可能性があります。");
}
