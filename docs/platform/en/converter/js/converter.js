document.addEventListener('DOMContentLoaded', function () {
    // Back to top button functionality
    const backToTopButton = document.getElementById('back-to-top');

    if (backToTopButton) {
        // Initially hide the button
        backToTopButton.style.display = 'none';

        // Show/hide button based on scroll position
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });

        // Scroll to top when button is clicked
        backToTopButton.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.navigation-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Only apply smooth scrolling for links to the same page
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();

                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Copy button functionality for tool pages
    const copyBtn = document.getElementById('copyBtn');
    const outputText = document.getElementById('outputText');

    if (copyBtn && outputText) {
        copyBtn.addEventListener('click', function () {
            outputText.select();
            document.execCommand('copy');

            // Show feedback
            const originalText = this.textContent;
            this.textContent = 'Copied!';

            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        });
    }
});