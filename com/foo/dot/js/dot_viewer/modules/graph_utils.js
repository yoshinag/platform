/**
 * graph_utils.js - グラフユーティリティモジュール
 * 
 * このモジュールは、グラフ描画に関連するユーティリティ関数を提供します。
 * 主な責務:
 * - 現在選択されている記法（DOT/Mermaid）の取得
 * - グラフ関連のヘルパー関数
 */
import { notationRadios } from './dom_elements.js';

/**
 * 現在選択されている記法を取得します
 * @returns {string} 選択されている記法（'dot'または'mermaid'）
 */
export function getSelectedNotation() {
    for (const radio of notationRadios) {
        if (radio.checked) return radio.value;
    }
    return 'mermaid'; // デフォルトまたはフォールバック
}
