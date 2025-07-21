// js/mermaid_viewer/modules/state.js
export let vizInstance = null;
export let allTemplates = [];
export let uploadedFileName = null;

// Tab management
export let tabs = [
    {
        id: 'tab-1',
        title: 'タブ 1',
        content: '',
        notation: 'mermaid' // Default notation
    }
];
export let activeTabIndex = 0;

export function setVizInstance(instance) {
    vizInstance = instance;
}

export function setAllTemplates(templates) {
    allTemplates = templates;
}

export function setUploadedFileName(fileName) {
    uploadedFileName = fileName;
}

export function getUploadedFileName() {
    return uploadedFileName;
}

// Tab management functions
export function getActiveTab() {
    return tabs[activeTabIndex];
}

export function setActiveTabIndex(index) {
    if (index >= 0 && index < tabs.length) {
        activeTabIndex = index;
        return true;
    }
    return false;
}

export function getActiveTabContent() {
    return getActiveTab().content;
}

export function setActiveTabContent(content) {
    tabs[activeTabIndex].content = content;
}

export function getActiveTabNotation() {
    return getActiveTab().notation;
}

export function setActiveTabNotation(notation) {
    tabs[activeTabIndex].notation = notation;
}

export function addTab(title = null) {
    const id = 'tab-' + (tabs.length + 1);
    const newTitle = title || `タブ ${tabs.length + 1}`;
    
    tabs.push({
        id,
        title: newTitle,
        content: '',
        notation: 'mermaid' // Default notation
    });
    
    return tabs.length - 1; // Return the index of the new tab
}

export function removeTab(index) {
    if (tabs.length <= 1) {
        return false; // Don't remove the last tab
    }
    
    if (index >= 0 && index < tabs.length) {
        tabs.splice(index, 1);
        
        // Adjust activeTabIndex if needed
        if (activeTabIndex >= tabs.length) {
            activeTabIndex = tabs.length - 1;
        }
        
        return true;
    }
    
    return false;
}

export function renameTab(index, newTitle) {
    if (index >= 0 && index < tabs.length) {
        tabs[index].title = newTitle;
        return true;
    }
    return false;
}