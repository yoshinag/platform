/**
 * state.js - アプリケーション状態管理モジュール
 * 
 * このモジュールは、アプリケーションの状態を管理します。
 * 主な責務:
 * - Viz.jsインスタンスの保持
 * - テンプレートデータの保持
 * - 状態変数へのアクセス制御
 */
export let vizInstance = null;
export let allTemplates = [];
// CDN関連の状態変数は静的スクリプトタグを使用するようになったため削除

export function setVizInstance(instance) {
    vizInstance = instance;
}

export function setAllTemplates(templates) {
    allTemplates = templates;
}

// CDN関連のセッター関数は静的スクリプトタグを使用するようになったため削除
