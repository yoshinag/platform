document.addEventListener('DOMContentLoaded', function() {
    // Back to top button functionality
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // Initially hide the button
        backToTopButton.style.display = 'none';
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
        
        // Scroll to top when button is clicked
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Create command navigation for each h2 section
    const h2Elements = document.querySelectorAll('h2');
    
    h2Elements.forEach(h2 => {
        // Create navigation container
        const commandNav = document.createElement('div');
        commandNav.className = 'command-nav';
        
        // Create navigation title
        const navTitle = document.createElement('p');
        navTitle.textContent = '';
        navTitle.style.fontWeight = 'bold';
        navTitle.style.marginBottom = '10px';
        commandNav.appendChild(navTitle);
        
        // Create navigation list
        const navList = document.createElement('ul');
        
        // Find all h3 elements that follow this h2 until the next h2
        let nextElement = h2.nextElementSibling;
        const commandLinks = [];
        const h3Elements = [];
        
        // Function to recursively find h3 elements within a container
        function findH3Elements(container) {
            // First check if the container itself is an h3
            if (container.tagName === 'H3') {
                h3Elements.push(container);
            }
            
            // Then check all child elements
            const children = container.children;
            for (let i = 0; i < children.length; i++) {
                if (children[i].tagName === 'H3') {
                    h3Elements.push(children[i]);
                } else {
                    // Recursively check this child's children
                    findH3Elements(children[i]);
                }
            }
        }
        
        // Find all h3 elements between this h2 and the next h2
        while (nextElement && nextElement.tagName !== 'H2') {
            if (nextElement.tagName === 'H3') {
                h3Elements.push(nextElement);
            } else {
                // Check for h3 elements inside this element
                findH3Elements(nextElement);
            }
            nextElement = nextElement.nextElementSibling;
        }
        
        // Process all found h3 elements
        h3Elements.forEach(h3Element => {
            // Create a unique ID for the h3 if it doesn't have one
            if (!h3Element.id) {
                // Extract command name from h3 text (before the dash if present)
                const commandText = h3Element.textContent;
                const commandName = commandText.split(' - ')[0].trim();
                h3Element.id = 'command-' + commandName.toLowerCase();
            }
            
            // Create list item and link
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#' + h3Element.id;
            
            // Extract command name from h3 text (before the dash if present)
            const commandText = h3Element.textContent;
            const commandName = commandText.split(' - ')[0].trim();
            link.textContent = commandName;
            
            // Add data attribute to store the target element id
            link.dataset.target = h3Element.id;
            
            listItem.appendChild(link);
            navList.appendChild(listItem);
            commandLinks.push(link);
        });
        
        // Only add the navigation if there are commands in this section
        if (navList.children.length > 0) {
            commandNav.appendChild(navList);
            
            // Find the paragraph that follows the h2
            let insertAfterElement = h2;
            let nextSibling = h2.nextElementSibling;
            
            // If the next element is a paragraph, insert after it instead of after the h2
            if (nextSibling && nextSibling.tagName === 'P') {
                insertAfterElement = nextSibling;
            }
            
            insertAfterElement.insertAdjacentElement('afterend', commandNav);
        }
        
        // Add smooth scrolling to command links
        commandLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.dataset.target;
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            });
        });
    });
    
    // Smooth scrolling for category navigation links
    const categoryLinks = document.querySelectorAll('.category-nav a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });
});