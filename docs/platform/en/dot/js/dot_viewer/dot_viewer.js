// js/dot_viewer/dot_viewer.js
import { initializeApp } from './modules/app_initializer.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(err => {
        console.error("Failed to initialize application from dot_viewer.js:", err);
        // Display a user-friendly message in the graph container or a dedicated error div
        const gc = document.getElementById('graph-container');
        if (gc) {
            gc.innerHTML = '<p class="error-message">The application could not be started due to a fatal error. Please check the console.</p>';
        }
    });
});
