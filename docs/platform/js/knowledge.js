/**
 * Generates a random alphanumeric string of specified length
 * @param {number} length - The length of the string to generate
 * @returns {string} A random alphanumeric string
 */
function generateRandomAlphanumeric(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

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

    // Smooth scrolling for all internal links
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Only process internal links (not external links)
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

    // Add IDs to headings that don't have them for easier navigation
    const headings = document.querySelectorAll('h2, h3');

    // Get the current page filename to use as a prefix
    const pathParts = window.location.pathname.split('/');
    const filename = pathParts[pathParts.length - 1].replace('.html', '');

    headings.forEach(heading => {
        if (!heading.id) {
            // Determine the appropriate prefix based on the heading context
            let prefix = 'h';

            // For service cards, use 'sc' prefix
            if (heading.closest('.service-card')) {
                prefix = 'sc';

                // Add category info to prefix if available
                const categoryHeading = heading.closest('.service-grid').previousElementSibling;
                if (categoryHeading && categoryHeading.classList.contains('service-category')) {
                    const categoryText = categoryHeading.textContent.trim();
                    const categoryPrefix = categoryText
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '')
                        .substring(0, 3); // Take first 3 chars of category

                    prefix = `sc-${categoryPrefix}`;
                }
            }
            // For numbered headings, use 'sec' prefix with section number
            else if (/^\d+\./.test(heading.textContent.trim())) {
                const sectionMatch = heading.textContent.trim().match(/^(\d+)\./);
                if (sectionMatch && sectionMatch[1]) {
                    prefix = `sec${sectionMatch[1]}`;
                }
            }

            // Add filename to prefix for global uniqueness
            prefix = `${filename}-${prefix}`;

            // Generate the random part (5 alphanumeric chars)
            const randomPart = generateRandomAlphanumeric(5);

            // Combine prefix and random part
            const headingId = `${prefix}-${randomPart}`;

            heading.id = headingId;
        }
    });
});