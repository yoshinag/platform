/**
 * dot_viewer.js - DOT言語とMermaid記法のグラフ描画ツール
 * 
 * このアプリケーションは、DOT言語とMermaid記法を使用して様々な種類のダイアグラムを
 * 作成、表示、編集するためのChrome拡張機能です。
 * 
 * 主な機能:
 * - DOT言語とMermaid記法の両方に対応
 * - テンプレートを使用して素早くダイアグラムを作成
 * - ダイアグラムをPNGまたはSVG形式でダウンロード
 * - コードのコピー、ペースト、クリア機能
 * - 全画面表示モード
 * 
 * 外部ライブラリ:
 * - Viz.js: DOT言語のレンダリングに使用
 * - Mermaid.js: Mermaid記法のレンダリングに使用
 */
import { initializeApp } from './modules/app_initializer.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(err => {
        console.error("dot_viewer.jsからアプリケーションの初期化に失敗しました:", err);
        // グラフコンテナまたは専用のエラーdivにユーザーフレンドリーなメッセージを表示
        const gc = document.getElementById('graph-container');
        if (gc) {
            gc.innerHTML = '<p class="error-message">致命的なエラーによりアプリケーションを起動できませんでした。コンソールを確認してください。</p>';
        }
    });
});
