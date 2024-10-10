chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape") {
        let scrapedData = scrapeLinkedInProfiles();
        sendResponse({ data: scrapedData });
    }
});

//function to scrape datails from LinkedIn
function scrapeLinkedInProfiles() {
    console.log("Scraping LinkedIn profiles initiated");
    
    // Select all <li> elements
    const profileElements = document.querySelectorAll('.reusable-search__result-container');
    let scrapedData = [];

    // Iterate through each <li> element
    profileElements.forEach(profile => {
        // Get the profile image
        const imgElement = profile.querySelector('.entity-result__universal-image img');
        const imageSrc = imgElement ? imgElement.src : 'No image found';

        // Get the profile name
        const nameElement = profile.querySelector('.entity-result__title-text');
        const fullName = nameElement ? nameElement.innerText.trim() : 'No name found';
        const name = fullName.split('\n')[0].trim();;

        // Get the badge (e.g., 1st, 2nd connection)
        const badgeElement = profile.querySelector('.entity-result__badge');
        const fullBadge = badgeElement ? badgeElement.innerText.trim() : 'No badge found';
        const badge = fullBadge.replace('•', '').split('\n')[0].trim();;

        // Get the username (from the profile link)
        const usernameLink = profile.querySelector('.app-aware-link');
        const username = usernameLink ? usernameLink.href.split('/').pop().split('?')[0] : 'No username found';

        // Push the extracted data to the array
        scrapedData.push({
            name,
            badge,
            username,
            image: imageSrc,
        });
    });

    console.log(scrapedData);
    console.log("Scraping LinkedIn profiles completed")
    return scrapedData;
}