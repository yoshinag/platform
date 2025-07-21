// js/mermaid_viewer/modules/language_detector.js

/**
 * Detects whether the given content is DOT language or Mermaid syntax
 * @param {string} content - The content to analyze
 * @returns {string} - 'dot' or 'mermaid'
 */
export function detectLanguage(content) {
    // As per requirement "dot機能は除外" (Exclude DOT functionality),
    // always return 'mermaid' regardless of content
    return 'mermaid';

    /* Original detection logic kept for documentation purposes
    if (!content || typeof content !== 'string') {
        return 'mermaid'; // Default to mermaid if content is invalid
    }

    // Trim whitespace and get the first few lines for analysis
    const trimmedContent = content.trim();
    const firstLines = trimmedContent.split('\n', 5).join('\n');
    
    // Check for Mermaid patterns
    if (isMermaid(trimmedContent, firstLines)) {
        return 'mermaid';
    }
    
    // Check for DOT patterns
    if (isDot(trimmedContent, firstLines)) {
        return 'dot';
    }
    
    // If no clear pattern is detected, use heuristics for a best guess
    return guessByHeuristics(trimmedContent);
    */
}

/**
 * Checks if the content matches Mermaid syntax patterns
 * @param {string} fullContent - The full content
 * @param {string} firstLines - The first few lines of content
 * @returns {boolean} - True if content appears to be Mermaid
 */
function isMermaid(fullContent, firstLines) {
    // Mermaid diagrams typically start with a diagram type keyword
    const mermaidStartPatterns = [
        /^graph\s+[A-Za-z]+/i,       // graph TD, graph LR, etc.
        /^sequenceDiagram/i,
        /^gantt/i,
        /^classDiagram/i,
        /^stateDiagram/i,
        /^stateDiagram-v2/i,
        /^pie/i,
        /^erDiagram/i,
        /^gitGraph/i,
        /^journey/i,
        /^mindmap/i,
        /^timeline/i,
        /^quadrantChart/i,
        /^flowchart\s+[A-Za-z]+/i    // flowchart TD, flowchart LR, etc.
    ];
    
    // Check if content starts with any of the Mermaid patterns
    for (const pattern of mermaidStartPatterns) {
        if (pattern.test(firstLines)) {
            return true;
        }
    }
    
    // Check for other Mermaid-specific syntax
    const mermaidSyntaxPatterns = [
        /-->/,                       // Arrow in flowcharts
        /==/,                        // Double line in sequence diagrams
        /\s*%%\s/,                   // Mermaid comments
        /\s*subgraph\s+/,            // Subgraph keyword
        /\s*end\s*$/m,               // End keyword on its own line
        /\s*class\s+\w+\s+\w+/,      // Class styling
        /\s*classDef\s+/,            // Class definition
        /\s*click\s+\w+\s+/,         // Click handler
        /\s*participant\s+/,         // Sequence diagram participant
        /\s*actor\s+/,               // Sequence diagram actor
        /\s*activate\s+/,            // Sequence diagram activate
        /\s*deactivate\s+/,          // Sequence diagram deactivate
        /\s*loop\s+/,                // Loop in sequence diagrams
        /\s*rect\s+/,                // Rectangle in sequence diagrams
        /\s*alt\s+/,                 // Alternative in sequence diagrams
        /\s*opt\s+/,                 // Optional in sequence diagrams
        /\s*par\s+/,                 // Parallel in sequence diagrams
        /\s*section\s+/              // Section in gantt charts
    ];
    
    // Count how many Mermaid-specific patterns are found
    let mermaidPatternCount = 0;
    for (const pattern of mermaidSyntaxPatterns) {
        if (pattern.test(fullContent)) {
            mermaidPatternCount++;
            // If we find multiple Mermaid patterns, it's likely Mermaid
            if (mermaidPatternCount >= 2) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Checks if the content matches DOT language patterns
 * @param {string} fullContent - The full content
 * @param {string} firstLines - The first few lines of content
 * @returns {boolean} - True if content appears to be DOT
 */
function isDot(fullContent, firstLines) {
    // DOT graphs typically start with digraph or graph
    const dotStartPatterns = [
        /^digraph\s+\w+\s*{/i,       // Directed graph
        /^graph\s+\w+\s*{/i,         // Undirected graph
        /^strict\s+digraph\s+\w+\s*{/i, // Strict directed graph
        /^strict\s+graph\s+\w+\s*{/i    // Strict undirected graph
    ];
    
    // Check if content starts with any of the DOT patterns
    for (const pattern of dotStartPatterns) {
        if (pattern.test(firstLines)) {
            return true;
        }
    }
    
    // Check for other DOT-specific syntax
    const dotSyntaxPatterns = [
        /\s*->\s*/,                  // Directed edge
        /\s*--\s*/,                  // Undirected edge
        /\s*\[\s*\w+\s*=\s*/,        // Attribute in square brackets
        /\s*;\s*$/m,                 // Semicolon at end of line
        /\s*rankdir\s*=\s*/,         // rankdir attribute
        /\s*node\s*\[/,              // Node attributes
        /\s*edge\s*\[/,              // Edge attributes
        /\s*subgraph\s+\w+\s*{/,     // Subgraph
        /\s*label\s*=\s*/,           // Label attribute
        /\s*shape\s*=\s*/,           // Shape attribute
        /\s*style\s*=\s*/,           // Style attribute
        /\s*color\s*=\s*/,           // Color attribute
        /\s*fillcolor\s*=\s*/,       // Fill color attribute
        /\s*fontcolor\s*=\s*/,       // Font color attribute
        /\s*fontsize\s*=\s*/,        // Font size attribute
        /\s*fontname\s*=\s*/,        // Font name attribute
        /\s*arrowhead\s*=\s*/,       // Arrow head attribute
        /\s*arrowtail\s*=\s*/        // Arrow tail attribute
    ];
    
    // Count how many DOT-specific patterns are found
    let dotPatternCount = 0;
    for (const pattern of dotSyntaxPatterns) {
        if (pattern.test(fullContent)) {
            dotPatternCount++;
            // If we find multiple DOT patterns, it's likely DOT
            if (dotPatternCount >= 2) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Uses heuristics to guess the language when no clear pattern is detected
 * @param {string} content - The content to analyze
 * @returns {string} - 'dot' or 'mermaid'
 */
function guessByHeuristics(content) {
    // Count occurrences of certain patterns
    const dotPatterns = ['->', '--', '[', ']', ';'];
    const mermaidPatterns = ['-->', '---', '===', '%%', 'subgraph', 'end'];
    
    let dotScore = 0;
    let mermaidScore = 0;
    
    // Check for DOT patterns
    for (const pattern of dotPatterns) {
        const matches = content.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
        if (matches) {
            dotScore += matches.length;
        }
    }
    
    // Check for Mermaid patterns
    for (const pattern of mermaidPatterns) {
        const matches = content.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'));
        if (matches) {
            mermaidScore += matches.length;
        }
    }
    
    // Check for curly braces (more common in DOT)
    const curlyBraces = content.match(/{|}/g);
    if (curlyBraces) {
        dotScore += curlyBraces.length * 0.5; // Weight less than other patterns
    }
    
    // Check for file extension in the content (sometimes people include the original syntax in comments)
    if (content.includes('.dot') || content.includes('.gv')) {
        dotScore += 5;
    }
    if (content.includes('.mmd') || content.includes('.mermaid')) {
        mermaidScore += 5;
    }
    
    // Prioritize Mermaid unless DOT is significantly more likely (20% threshold)
    // This implements the requirement to prefer Mermaid when it's difficult to determine
    return dotScore > mermaidScore * 1.2 ? 'dot' : 'mermaid';
}