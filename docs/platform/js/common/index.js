document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const contentWrapper = document.querySelector('.content-wrapper'); // Needed if button moves with content edge

    // Get language from html tag
    const lang = document.documentElement.lang || 'en';

    // Button text based on language
    const buttonText = {
        'en': {
            open: 'Open Sidebar',
            close: 'Close Sidebar'
        },
        'ja': {
            open: 'サイドバーを開く',
            close: 'サイドバーを閉じる'
        }
    };

    // Default to English if language not supported
    const texts = buttonText[lang] || buttonText['en'];

    // Function to update button symbol and title
    function updateToggleButton() {
        if (sidebar.classList.contains('collapsed')) {
            toggleBtn.innerHTML = '&gt;'; // Icon for "open" (>)
            toggleBtn.title = texts.open;
        } else {
            toggleBtn.innerHTML = '&lt;'; // Icon for "close" (<)
            toggleBtn.title = texts.close;
        }
    }

    // Load sidebar state from localStorage
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }
    updateToggleButton(); // Set initial button state

    toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        const currentlyCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', currentlyCollapsed);
        updateToggleButton();
    });
});