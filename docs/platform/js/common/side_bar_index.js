/**
 * Table of Contents Sidebar Generator
 *
 * This script automatically generates a table of contents sidebar based on the headings
 * in the document and provides smooth scrolling functionality.
 */

// Configuration options
const TOC_CONFIG = {
    headingSelector: 'h1, h2, h3',      // CSS selector for headings to include
    tocTitle: '目次',                    // Title of the table of contents
    scrollOffset: 20,                   // Offset from the top when scrolling to a heading (matches knowledge.js)
    mainContainerSelector: 'body',      // Where to insert the content wrapper
    skipMainTitle: true                 // Whether to skip h1 headings
};

// Wait for knowledge.js to finish processing before initializing TOC
document.addEventListener('DOMContentLoaded', function () {
    // Check if knowledge.js has already run by looking for heading IDs
    const headings = document.querySelectorAll('h1, h2, h3');
    let knowledgeJsHasRun = false;

    // Check if at least some headings already have IDs (indicating knowledge.js ran)
    for (let i = 0; i < headings.length; i++) {
        if (headings[i].id) {
            knowledgeJsHasRun = true;
            break;
        }
    }

    if (knowledgeJsHasRun) {
        // If knowledge.js has run, initialize TOC immediately
        initTableOfContents();
    } else {
        // Otherwise, wait a bit to ensure knowledge.js runs first
        setTimeout(initTableOfContents, 200);
    }
});

/**
 * Initialize the table of contents functionality
 */
function initTableOfContents() {
    const headings = document.querySelectorAll(TOC_CONFIG.headingSelector);

    // If there are no headings, don't create a table of contents
    if (headings.length === 0) return;

    // Check if the page already has a table of contents section
    const existingToc = document.getElementById('table-of-contents');

    // If there's an existing TOC, we'll still add our sidebar but use the existing TOC links
    if (existingToc) {
        // Ensure all headings have IDs for linking (they should already have them)
        ensureHeadingIds(headings);

        // Create a sidebar using the existing TOC content
        const sidebar = createSidebarFromExistingToc(existingToc);

        // Restructure the DOM to include the sidebar
        restructureDOM(sidebar);
    } else {
        // Standard flow for pages without an existing TOC
        // Ensure all headings have IDs for linking
        ensureHeadingIds(headings);

        // Create the sidebar and table of contents
        const sidebar = createTocSidebar(headings);

        // Restructure the DOM to include the sidebar
        restructureDOM(sidebar);
    }

    // Set up scroll tracking to highlight the current section in TOC
    setupScrollTracking(headings);
}

/**
 * Create a sidebar using an existing table of contents
 * @param {HTMLElement} existingToc - The existing table of contents element
 * @returns {HTMLElement} The created sidebar element
 */
function createSidebarFromExistingToc(existingToc) {
    // Create the sidebar container
    const sidebar = document.createElement('div');
    sidebar.className = 'toc-sidebar';

    // Create the table of contents header
    const tocHeader = document.createElement('h2');
    tocHeader.textContent = TOC_CONFIG.tocTitle;
    tocHeader.className = 'toc-header';
    sidebar.appendChild(tocHeader);

    // Clone the existing TOC list
    const existingList = existingToc.querySelector('ul');
    if (existingList) {
        const tocList = existingList.cloneNode(true);
        tocList.className = 'toc-list';

        // Add our custom classes to the list items
        const listItems = tocList.querySelectorAll('li');
        listItems.forEach(item => {
            item.className = 'toc-item';

            // Find the anchor and add our click handler
            const anchor = item.querySelector('a');
            if (anchor && anchor.getAttribute('href').startsWith('#')) {
                const targetId = anchor.getAttribute('href').substring(1);

                // Replace the default click behavior
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Remove active class from all TOC links
                    const tocLinks = document.querySelectorAll('.toc-item a');
                    tocLinks.forEach(l => l.classList.remove('active'));

                    // Add active class to this link
                    this.classList.add('active');

                    scrollToHeading(targetId);
                });
            }
        });

        sidebar.appendChild(tocList);
    }

    return sidebar;
}

/**
 * Ensure all headings have IDs for anchor links
 * @param {NodeList} headings - The headings to process
 */
function ensureHeadingIds(headings) {
    headings.forEach(heading => {
        if (!heading.id) {
            const headingText = heading.textContent.trim();
            const headingId = generateIdFromText(headingText);
            heading.id = headingId;
        }
    });
}

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

/**
 * Generate a valid ID from text content
 * @param {string} text - The text to convert to an ID
 * @returns {string} A valid ID string
 */
function generateIdFromText(text) {
    // IMPORTANT: This must match EXACTLY the logic in knowledge.js
    // We're using prefix + 5-digit random alphanumeric characters

    // Get the current page filename to use as a prefix
    const pathParts = window.location.pathname.split('/');
    const filename = pathParts[pathParts.length - 1].replace('.html', '');

    // Use a simple prefix for headings in the sidebar
    let prefix = `${filename}-h`;

    // Generate the random part (5 alphanumeric chars)
    const randomPart = generateRandomAlphanumeric(5);

    // Combine prefix and random part
    const headingId = `${prefix}-${randomPart}`;

    return headingId;
}

/**
 * Create the table of contents sidebar
 * @param {NodeList} headings - The headings to include in the TOC
 * @returns {HTMLElement} The created sidebar element
 */
function createTocSidebar(headings) {
    // Create the sidebar container
    const sidebar = document.createElement('div');
    sidebar.className = 'toc-sidebar';

    // Create the table of contents header
    const tocHeader = document.createElement('h2');
    tocHeader.textContent = TOC_CONFIG.tocTitle;
    tocHeader.className = 'toc-header';
    sidebar.appendChild(tocHeader);

    // Create the table of contents list
    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';

    // Process each heading and add it to the table of contents
    headings.forEach(heading => {
        // Skip the main title (h1) if configured to do so
        if (TOC_CONFIG.skipMainTitle && heading.tagName === 'H1') return;

        // Skip the TOC header itself
        if (heading === tocHeader) return;

        // Create a list item for the heading
        const listItem = createTocItem(heading);
        tocList.appendChild(listItem);
    });

    sidebar.appendChild(tocList);
    return sidebar;
}

/**
 * Create a table of contents item for a heading
 * @param {HTMLElement} heading - The heading to create an item for
 * @returns {HTMLElement} The created list item
 */
function createTocItem(heading) {
    const listItem = document.createElement('li');
    listItem.className = `toc-item toc-${heading.tagName.toLowerCase()}`;

    // Create a link to the heading
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;

    // Add smooth scrolling to the link
    link.addEventListener('click', function (e) {
        e.preventDefault();

        // Remove active class from all TOC links
        const tocLinks = document.querySelectorAll('.toc-item a');
        tocLinks.forEach(l => l.classList.remove('active'));

        // Add active class to this link
        this.classList.add('active');

        scrollToHeading(heading.id);
    });

    listItem.appendChild(link);
    return listItem;
}

/**
 * Scroll to a heading with smooth behavior
 * @param {string} headingId - The ID of the heading to scroll to
 */
function scrollToHeading(headingId) {
    // Check if element exists
    const targetElement = document.getElementById(headingId);
    if (!targetElement) return;

    // Use the same scrolling method as knowledge.js for consistency
    window.scrollTo({
        top: targetElement.offsetTop - TOC_CONFIG.scrollOffset,
        behavior: 'smooth'
    });

    // Update URL hash without jumping
    history.pushState(null, null, `#${headingId}`);
}

/**
 * Restructure the DOM to include the sidebar
 * @param {HTMLElement} sidebar - The sidebar element to add
 */
function restructureDOM(sidebar) {
    // Find the main content container
    const contentContainer = document.querySelector(TOC_CONFIG.mainContainerSelector);
    if (!contentContainer) return;

    // Create a wrapper for the existing content and the sidebar
    const wrapper = document.createElement('div');
    wrapper.className = 'content-wrapper';

    // Move all body content to a main content div
    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';

    // Move all existing body children to the main content div
    // We need to use a while loop because the collection is live and changes as we move elements
    while (contentContainer.children.length > 0) {
        mainContent.appendChild(contentContainer.children[0]);
    }

    // Add the main content and sidebar to the wrapper
    wrapper.appendChild(mainContent);
    wrapper.appendChild(sidebar);

    // Add the wrapper to the body
    contentContainer.appendChild(wrapper);
}

/**
 * Set up scroll tracking to highlight the current section in the TOC
 * @param {NodeList} headings - The headings to track
 */
function setupScrollTracking(headings) {
    if (headings.length === 0) return;

    // Convert NodeList to Array for easier manipulation
    let headingsArray = Array.from(headings);

    // Skip the main title (h1) if configured to do so
    if (TOC_CONFIG.skipMainTitle) {
        headingsArray = headingsArray.filter(heading => heading.tagName !== 'H1');
    }

    // Function to determine which heading is currently in view
    function getCurrentHeading() {
        // Get current scroll position with a small offset
        const scrollPosition = window.scrollY + TOC_CONFIG.scrollOffset + 10;

        // Find the last heading that is above the current scroll position
        for (let i = headingsArray.length - 1; i >= 0; i--) {
            if (headingsArray[i].offsetTop <= scrollPosition) {
                return headingsArray[i];
            }
        }

        // If no heading is found, return the first one
        return headingsArray.length > 0 ? headingsArray[0] : null;
    }

    // Function to update the active TOC item
    function updateActiveTocItem() {
        // Get the current heading
        const currentHeading = getCurrentHeading();
        if (!currentHeading) return;

        // Remove active class from all TOC links
        const tocLinks = document.querySelectorAll('.toc-item a');
        tocLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to the TOC link corresponding to the current heading
        const activeLink = document.querySelector(`.toc-item a[href="#${currentHeading.id}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Update active TOC item on scroll
    window.addEventListener('scroll', updateActiveTocItem);

    // Update on page load to ensure it works when navigating directly to a section with a hash
    window.addEventListener('load', function () {
        // If there's a hash in the URL, wait a bit for the page to scroll to that section
        if (window.location.hash) {
            setTimeout(updateActiveTocItem, 100);
        } else {
            updateActiveTocItem();
        }
    });

    // Initial update
    updateActiveTocItem();
}
