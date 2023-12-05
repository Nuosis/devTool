document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('logIcon').addEventListener('click', fetchLogDates);
  document.getElementById('settingsIcon').addEventListener('click', loadSettings);
  // Assuming you have an endpoint like /api/logs to get your JSON data
  // This function will fetch and render the initial log dates
  function fetchLogDates() {
    // Clear out the current elements in the sidebar and main divs
    const sidebar = document.getElementById('sidebar');
    const logContent = document.getElementById('log-content');
    sidebar.innerHTML = '';
    logContent.innerHTML = '';

    const endpoint = 'http://localhost:4040/log';
    const headers = {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlLZXkiOiJlMThhMmZlNTVmMDg1ZDI2M2I0MDk1ZGI1MjljY2IxZmVhZDc3OTRlNjJkOWY5MTJjMWYzYTdhNWZkODk2OTg5IiwiaWF0IjoxNzAwOTMzMDM0fQ.ioRoID-SoWKgXyaoqjkx6mHTaRt9IgQ1RErKCvc9_Bs'
    };
  
    fetch(endpoint, { headers: headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(dates => {
        const sidebar = document.getElementById('sidebar');
        // Create a new Set to store unique dates
        const uniqueDates = new Set();
  
        // Process each date object and extract the 'created' property
        dates.forEach(dateObj => {
          const dateCreated = new Date(dateObj.created).toDateString();
          uniqueDates.add(dateCreated);
        });
  
        // Convert the Set back to an array and sort it in descending order
        const sortedUniqueDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));
  
        // Now, create the sidebar elements for each unique date
        sortedUniqueDates.forEach(uniqueDate => {
          console.log('Processing date:', uniqueDate); // Log the current date being processed
          const dateElement = document.createElement('div');
          dateElement.textContent = uniqueDate;
          dateElement.className = 'sidebarDate';
          dateElement.addEventListener('click', () => fetchLogDetails(uniqueDate));
          sidebar.appendChild(dateElement);
        });
      })
      .catch(error => {
        console.error('Error fetching log dates:', error);
      });
  }
  

  fetchLogDates();
});

// This function will fetch and render the log details for a selected date
function fetchLogDetails(date) {
  // Parse the date string and format it into YYYY-MM-DD
  const dateObj = new Date(date);
  const formattedDate = dateObj.toISOString().split('T')[0]; // Converts to '2023-11-28' format

  // Construct the conditions JSON
  const conditions = JSON.stringify([{ "date": formattedDate }]);
  console.log('conditions:', conditions )

  // URL encode the conditions JSON
  const encodedConditions = encodeURIComponent(conditions);

  // Construct the full URL with the encoded query string
  const endpoint = `http://localhost:4040/log?conditions=${encodedConditions}`;
  console.log('endPoint:', endpoint )

  const headers = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlLZXkiOiJlMThhMmZlNTVmMDg1ZDI2M2I0MDk1ZGI1MjljY2IxZmVhZDc3OTRlNjJkOWY5MTJjMWYzYTdhNWZkODk2OTg5IiwiaWF0IjoxNzAwOTMzMDM0fQ.ioRoID-SoWKgXyaoqjkx6mHTaRt9IgQ1RErKCvc9_Bs'
  };

  // Perform the fetch request with the Authorization header
  fetch(endpoint, { headers: headers })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(logEntries => {
      const logContent = document.getElementById('log-content');
      logContent.innerHTML = ''; // Clear previous entries

      if (!Array.isArray(logEntries)) {
        // If 'logEntries' is not an array, log and throw an error
        console.error('Expected an array of log entries, but received:', logEntries);
        throw new Error('Data format error: Expected an array of log entries');
      }

      // If 'logEntries' is an array, proceed to populate the log details
      logEntries.forEach(entry => {
        //console.log('Processing log entry:', entry); // Log the current log entry being processed
        const entryElement = document.createElement('div');
        entryElement.textContent = `${entry.created} - ${entry.type} - ${entry.message}`;
        entryElement.className = 'contentRow';
        logContent.appendChild(entryElement);
      });
    })
    .catch(error => {
      // Log and handle any errors that occurred during the fetch
      console.error('Error fetching log details:', error);
    });
}

function loadSettings() {
  // Clear out the current elements in the sidebar and main divs
  const sidebar = document.getElementById('sidebar');
  const logContent = document.getElementById('log-content');
  sidebar.innerHTML = '';
  logContent.innerHTML = '';

  // Create the "Developer Settings" button
  const devSettingsButton = document.createElement('button');
  devSettingsButton.textContent = 'Developer Settings';
  devSettingsButton.id = 'devSettings';
  devSettingsButton.className = 'sidebarButton';
  devSettingsButton.addEventListener('click', developerSettingsHandler);
  sidebar.appendChild(devSettingsButton);

  // Create the "Generate Token" button
  const generateTokenButton = document.createElement('button');
  generateTokenButton.textContent = 'Generate Token';
  generateTokenButton.id = 'generateToken';
  generateTokenButton.className = 'sidebarButton';
  generateTokenButton.addEventListener('click', generateTokenHandler);
  sidebar.appendChild(generateTokenButton);

  // Define the handlers for the buttons
  function developerSettingsHandler() {
    console.log('Developer Settings clicked');

    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    // Create the form element
    const form = document.createElement('form');
    form.addEventListener('submit', handleFormSubmit);

    // Create the company name input
    const companyNameInput = document.createElement('input');
    companyNameInput.type = 'text';
    companyNameInput.name = 'companyName';
    companyNameInput.placeholder = 'Company Name';
    companyNameInput.required = true;

    // Create the user name (email) input
    const userNameInput = document.createElement('input');
    userNameInput.type = 'text';
    userNameInput.name = 'userName';
    userNameInput.placeholder = 'User Name';
    userNameInput.required = true;

    // Create the password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.required = true;

    // Create the submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.textContent = 'Generate Token';

    // Append inputs and button to the form
    form.appendChild(companyNameInput);
    form.appendChild(userNameInput);
    form.appendChild(passwordInput);
    form.appendChild(submitButton);

    // Append the form to the log-content div
    logContent.appendChild(form);
  }

  function handleFormSubmit(event) {
    console.log('form submission clicked');
    event.preventDefault(); // Prevent the default form submission

    const logContent = document.getElementById('log-content');

    // Extract form data
    const formData = new FormData(event.target);
    const data = {
        company: formData.get('companyName'),
        username: formData.get('userName'),
        password: formData.get('password')
    };
    console.log(data);

    // Make the API call
    fetch('http://localhost:4040/generateToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
      console.log('Raw response:', response); // Log the raw response object
      return response.json(); // Convert response to JSON
    })
    .then(data => {
        // Display the response
        const responseDiv = document.createElement('div');
        responseDiv.className = 'apiResponse';
        responseDiv.textContent = JSON.stringify(data, null, 2);
        logContent.appendChild(responseDiv);
    })
    .catch(error => {
        console.error('Error:', error);
    });
  } 


  function generateTokenHandler() {
      console.log('Generate Token clicked');
      // Implement the logic to generate a token
  }
}


