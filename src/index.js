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

  // Create the "Token Settings" button
  const tokenSettingsButton = document.createElement('button');
  tokenSettingsButton.textContent = 'Token Settings';
  tokenSettingsButton.id = 'tokenSettings';
  tokenSettingsButton.className = 'sidebarButton';
  tokenSettingsButton.addEventListener('click', tokenSettingsHandler);
  sidebar.appendChild(tokenSettingsButton);

  // Create the "Generate Token" button
  const generateTokenButton = document.createElement('button');
  generateTokenButton.textContent = 'Generate Token';
  generateTokenButton.id = 'generateToken';
  generateTokenButton.className = 'sidebarButton';
  generateTokenButton.addEventListener('click', generateTokenHandler);
  sidebar.appendChild(generateTokenButton);

  // Define the handlers for the buttons
  function tokenSettingsHandler() {
      console.log('Token Settings clicked');
      // Implement the logic or show the token settings
  }

  function generateTokenHandler() {
      console.log('Generate Token clicked');
      // Implement the logic to generate a token
  }
}


