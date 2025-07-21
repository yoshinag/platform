// js/mermaid_viewer/modules/markdown_parser.js

/**
 * Markdown Parser Module
 * 
 * This module provides functionality to parse Markdown files and extract code blocks.
 * It is used to support the feature of loading code from uploaded Markdown files
 * and creating separate tabs for each code block found.
 */

/**
 * Parses Markdown content and extracts code blocks
 * 
 * This function uses a regular expression to find all fenced code blocks (enclosed in ```)
 * in the Markdown content. For each code block, it extracts:
 * - The language (if specified after the opening ```)
 * - The content of the code block
 * 
 * It then determines the appropriate notation (dot or mermaid) based on the language.
 * 
 * @param {string} markdownContent - The Markdown content to parse
 * @returns {Array} - Array of objects with language, notation, and content properties
 */
export function parseMarkdown(markdownContent) {
    if (!markdownContent) {
        return [];
    }

    const codeBlocks = [];
    // Regular expression to match fenced code blocks
    // Captures: group 1 = language (optional), group 2 = code content
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)?\s*\n([\s\S]*?)\n```/g;
    
    let match;
    while ((match = codeBlockRegex.exec(markdownContent)) !== null) {
        const language = match[1] ? match[1].trim().toLowerCase() : '';
        const content = match[2];
        
        // As per requirement "markdownの読み込みでもmermaidのみ抽出として" (extract only Mermaid when loading Markdown)
        // Skip DOT code blocks and treat all others as Mermaid
        if (language === 'dot' || language === 'graphviz') {
            // Skip DOT code blocks
            continue;
        }
        
        // Set notation to 'mermaid' for all code blocks regardless of language
        const notation = 'mermaid';
        
        codeBlocks.push({
            language,
            notation,
            content
        });
    }
    
    return codeBlocks;
}

/**
 * Checks if a file is a Markdown file based on its extension
 * 
 * This function examines the file name to determine if it has a Markdown extension
 * (.md or .markdown). It's used to decide whether to process a file as Markdown
 * or as a regular code file.
 * 
 * @param {File} file - The file to check
 * @returns {boolean} - True if the file is a Markdown file
 */
export function isMarkdownFile(file) {
    if (!file || !file.name) {
        return false;
    }
    
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.md') || fileName.endsWith('.markdown');
}

/**
 * Generates a tab title based on the Markdown file name and code block language
 * 
 * This function creates a meaningful title for tabs created from Markdown code blocks.
 * The title format depends on whether the code block has a language specified:
 * - If language is specified: "{filename} ({language})"
 * - If language is not specified: "{filename} #{index+1}"
 * 
 * This helps users identify the source and type of code in each tab.
 * 
 * @param {string} fileName - The name of the Markdown file
 * @param {string} language - The language of the code block
 * @param {number} index - The index of the code block in the file
 * @returns {string} - The generated tab title
 */
export function generateTabTitle(fileName, language, index) {
    // Remove file extension
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    
    // If language is specified, include it in the title
    if (language) {
        return `${baseName} (${language})`;
    }
    
    // If there are multiple code blocks without language, add an index
    return `${baseName} #${index + 1}`;
}