// js/mermaid_viewer/mermaid_viewer.js
import {initializeApp} from './modules/app_initializer.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(err => {
        console.error("Failed to initialize application from mermaid_viewer.js:", err);
        // Display a user-friendly message in the graph container or a dedicated error div
        const gc = document.getElementById('graph-container');
        if (gc) {
            gc.innerHTML = '<p class="error-message">致命的なエラーによりアプリケーションを起動できませんでした。コンソールを確認してください。</p>';
        }
    });
});