// background.js
chrome.action.onClicked.addListener(() => {
  // Get the current window to determine the screen size
  chrome.windows.getCurrent(function(currentWindow) {
    // Get all screens
    chrome.system.display.getInfo(function(displays) {
      // Use the primary display or the first one
      const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];

      // Calculate 60% of the screen dimensions
      const screenWidth = primaryDisplay.workArea.width;
      const screenHeight = primaryDisplay.workArea.height;
      const width = Math.round(screenWidth * 0.6);
      const height = Math.round(screenHeight * 0.6);

      // Open a new window with the popup content
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: width,
        height: height,
        left: Math.round((screenWidth - width) / 2),
        top: Math.round((screenHeight - height) / 2)
      });
    });
  });
});
