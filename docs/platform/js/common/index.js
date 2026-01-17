document.addEventListener('DOMContentLoaded', function () {
    // Sidebar functionality
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
        if (sidebar && sidebar.classList.contains('collapsed')) {
            toggleBtn.innerHTML = '&gt;'; // Icon for "open" (>)
            toggleBtn.title = texts.open;
        } else if (sidebar) {
            toggleBtn.innerHTML = '&lt;'; // Icon for "close" (<)
            toggleBtn.title = texts.close;
        }
    }

    // Load sidebar state from localStorage
    if (sidebar && toggleBtn) {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
        updateToggleButton(); // Set initial button state

        toggleBtn.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
            const currentlyCollapsed = sidebar.classList.contains('collapsed');
            localStorage.setItem('sidebarCollapsed', currentlyCollapsed);
            updateToggleButton();
        });
    }

    // Back to top button functionality
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Show back to top button when scrolling down
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'block';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
    }

    // Smooth scrolling for anchor links
    const tocLinks = document.querySelectorAll('.toc-list a');
    if (tocLinks.length > 0) {
        tocLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
});