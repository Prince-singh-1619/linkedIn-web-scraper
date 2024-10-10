chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received data from content script:", message.data);

    // Store data in Chrome's storage or perform other operations
    chrome.storage.local.set({ profiles: message.data }, () => {
        console.log("Profiles saved to local storage");
    });

    sendResponse({ status: "Data processed" });
});
