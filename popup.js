// Trigger content script when the button is clicked
document.getElementById("scrapeButton").addEventListener("click", () => {
  console.log("Scrape data function called");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Send a message to the content script to start scraping
    chrome.tabs.sendMessage(tabs[0].id, { action: "scrape" }, (response) => {
      if (response && response.data) {
        displayScrapedData(response.data);
      } else {
        console.log("No response or data received from content Script");
      }
    });
  });
  console.log("Scrape data function completed");
});

//declare an array to pass to it db.js file
// let profileInfo = [];

//function to display scraped data
function displayScrapedData(scrapedData) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ""; // Clear any previous data

  let btnVal = 1;
  scrapedData.forEach((profile) => {
    // Create profile container for each column
    const profileImg = document.createElement("div");
    profileImg.classList.add("profile_img"); // Assign class for styling

    const profileDetails = document.createElement("div");
    profileDetails.classList.add("profile_details"); // Assign class for styling

    const profileActions = document.createElement("div");
    profileActions.classList.add("profile_actions"); // Assign class for styling

    // Create image element
    const img = document.createElement("img");
    img.src = profile.image || "default-image.png"; // Fallback if no image is found

    // Create name element
    const nameP = document.createElement("p");
    nameP.classList.add("profile_name");
    nameP.innerText = `Name: ${profile.name}`;

    // Create badge element
    const badgeSpan = document.createElement("span");
    badgeSpan.innerText = `Badge: ${profile.badge}`;

    // Create username element
    const usernameP = document.createElement("p");
    usernameP.classList.add("profile_username");
    usernameP.innerText = `Username: ${profile.username}`;

    // Create add button
    const profileAddBtn = document.createElement("button");
    profileAddBtn.classList.add(`addBtn${btnVal}`);
    btnVal += 1;
    profileAddBtn.innerText = "+";

    // Append elements to profileImg (image column)
    profileImg.appendChild(img);

    // Append elements to profileDetails (name, badge, username column)
    profileDetails.appendChild(nameP);
    profileDetails.appendChild(badgeSpan);
    profileDetails.appendChild(usernameP);

    // Append button to profileActions (third column)
    profileActions.appendChild(profileAddBtn);

    // Create a row for all columns
    const details = document.createElement("div");
    details.classList.add("profile_row"); // Add class for styling the row

    // Append each column to the row
    details.appendChild(profileImg);
    details.appendChild(profileDetails);
    details.appendChild(profileActions);

    // Append the row to the resultDiv
    resultDiv.appendChild(details);


    //adding function to make call to api from username


    // Attach event listener to the newly created button
      profileAddBtn.addEventListener("click", async function () {
        console.log("Inside profile fetchAPI function");

        // find the parent profile_row element for the button that was clicked
        const profileRow = this.closest(".profile_row");

        //debugging
        console.log(profileRow)
        if (profileRow) {
          const usernameElement = profileRow.querySelector(".profile_username");
          console.log(usernameElement);  // Check if .profile_username exists inside profileRow
      
          if (usernameElement) {
              const username = usernameElement.innerText.replace("Username: ", "");
              console.log("Username: ", username);
          } else {
              console.log("No .profile_username found inside profileRow");
          }
        } else {
            console.log("profileRow is null or not found");
        }

        // extracting badge, name, and username
        const username = profileRow.querySelector(".profile_username").innerText.replace("Username: ", "");
        console.log("Username extracted");

        // Sending the request to the API
        console.log('profile.username = ',`${profile.username}`)
        const url = `https://linkedin-api8.p.rapidapi.com/profile-data-connection-count-posts?username=${profile.username}`;
        const options = {
          method: 'GET',
          headers: {
            // 'x-rapidapi-key': '1fd9cf5a06msh0fae0d54c5c9fe0p14b21cjsn46d2ce4e2c48', //------ codeiox api
            // 'x-rapidapi-key': '828059a362msh2852e3096c727b7p1d114djsn0ed96f08d793',   //-------- my api 
            'x-rapidapi-key': '4228a548d6msh6ba21b258f1b0a5p1dde54jsn15dc7ba48f93',   //-------- my 2nd api 
            'x-rapidapi-host': 'linkedin-api8.p.rapidapi.com'
		        // 'x-rapidapi-host': 'linkedin-profiles-and-company-data.p.rapidapi.com',
          }
        };

        let profileInfo = [] ;
        try {
          const response = await fetch(url, options);
          const result = await response.text();
          const parsedData = JSON.parse(result);
          console.log(parsedData);

          //pass data for extraction
          try{
            console.log("Passing data to extract useful info")
            profileInfo = extractProfile(parsedData);
            console.log("Extracting useful info completed")
          }catch(error){
            console.log("Error while passing data for extraction", error)
          }
        } 
        catch (error) {
          console.error(error);
        }

        // Once profileInfo is extracted, send it to your backend to be saved in the database        
        if(profileInfo){
          const dbUrl = 'https://server-db-be-store.vercel.app/people'
          try{
            const saveResponse = await fetch(dbUrl, {
              method:'POST',
              headers:{
                'Content-Type' : 'application/json',
              },
              body: JSON.stringify(profileInfo),
            })
            if(!saveResponse.ok){
              throw new Error(`Failed to save profile: ${saveResponse.status}`)
            }

            const saveResult = await saveResponse.json()
            console.log('Profile successfully saved to the database', saveResult)
          }
          catch(error){
            console.log('Error while saving profile to the database', error)
          }
        }

        // save the array to use it in another file
        // localStorage.setItem('profileInfo array', JSON.stringify(profileInfo));

      });
  });
}

async function extractProfile(jsonData){
  const first_name = jsonData.data.firstName;
  const last_name = jsonData.data.lastName;
  
  let currentCompany ;
  if (jsonData && Array.isArray(jsonData.data.fullPositions) && jsonData.data.fullPositions.length > 0) {
    currentCompany = jsonData.data.fullPositions[0].companyName;
    console.log('company name: ', currentCompany);
  } else {
    console.error("No company data found in fullPositions.");
  }

  //get company URL from company name
  const currentCompanyURL = await extractCompanyUrl(currentCompany);
  const companyEmail = await getCompanyEmail(first_name, last_name, currentCompanyURL);
  
  console.log("firstName:",first_name, ", lastName:",last_name, ", company:",currentCompany, ", companyURL:",currentCompanyURL, ", companyMail:",companyEmail)

  let profileInfo = {firstName: first_name, lastName: last_name, company: currentCompany, companyURL: currentCompanyURL, companyMail: companyEmail}

  //store in DataBase
  return profileInfo
}


//function to get company URL from company name
async function extractCompanyUrl(currentCompany){
  console.log('inside extract company url function')

  const googleApikey = 'AIzaSyAxEueqP-pKtHv-vLedMAEoJPmlOIn7ieg'
  const cx = "237f0fceda3aa4d72"; // From Google Custom Search Engine
  const url = `https://www.googleapis.com/customsearch/v1?q=${currentCompany}&key=${googleApikey}&cx=${cx}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data)

    if (data.items && data.items.length > 0) {
      const companyUrl = data.items[0].link;
      console.log("Company URL: ", companyUrl);
      return companyUrl;  // Return the URL after successful fetching
    } else {
      console.error("No search results found");
      return null;
    }
  } catch (error) {
    console.error("Error: ", error);
  }
}

async function getCompanyEmail(first_name, last_name, currentCompanyURL){
  console.log('Inside get_Company_Email function')

  try{
    // Extract the hostname
    // Use the URL object to parse the URL
    const parsedUrl = new URL(currentCompanyURL);
    const name_domain = parsedUrl.hostname;
    const domain = name_domain.replace('www.', '');
    console.log('Domain extracted:', domain); // Output: "salesql.com"

    //making emails
    const mail_1 = `${first_name}@${domain}`;
    const mail_2 = `${first_name[0]}${last_name}@${domain}`
    const mail_3 = `${first_name}.${last_name}@${domain}`
    const mail_4 = `${first_name}_${last_name}@${domain}`
    const mail_5 = `${last_name}.${first_name}@${domain}`
    const mail_6 = `${last_name}${first_name[0]}@${domain}`
    const mail_7 = `${first_name}.${last_name[0]}@${domain}`
    const mail_8 = `${first_name[0]}.${last_name}@${domain}`
    const mail_9 = `${first_name}${last_name.substring(0, 2)}@${domain}`
    const mail_10 = `${first_name[0]}.${last_name[0]}@${domain}`
    const mail_11 = `${first_name}.${last_name}1@${domain}`
    let emails = [mail_1, mail_2, mail_3, mail_4, mail_5, mail_6, mail_7, mail_8, mail_9, mail_10, mail_11];
    const emailsJson = JSON.stringify({emails});
    
    const url = "http://107.175.149.7/api/verify"
    async function verifyMultipleEmails(){
      try{
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: emailsJson,
        });

        if(!response.ok){
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('Verification result: ', result);
        //filter to get only valid email
        const validEmail = result.results.find((emailResponse) => emailResponse.includes("is valid"));
        if(validEmail){
          const email = validEmail.split(' ')[1];
          console.log('Valid email:', email);
          return email;
        }else{
          console.log('No valid email found');
          return null;
        }

      }catch(error){
        console.log("Error during email verification: ", error)
        return null;
      }
    }
  
    //setting a timeout of 40 seconds
    const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out after 40 seconds ")), 40000))

    const verificationResult = await Promise.race([ verifyMultipleEmails(), timeout]);
    return verificationResult;
  }
  catch(error){
    console.error("Error in getCompanyEmail function: ", error);
  }

  console.log('getCompanyEmail function completed')
}

// export default profileInfo;

// localStorage.setItem('profileInfo array', JSON.stringify(profileInfo));