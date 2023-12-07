import { developerSettingsHandler,handleDevSubmit,developerHandler,companyHandler,createUserHandler,generateTokenHandler, handleFormSubmit, loadSettings } from './settings.js';
import {setState, getState} from './state.js'

const state = getState()

function fetchLogDates() {
  const logContent = document.getElementById('log-content');
  logContent.innerHTML = ''; // Clear the log content
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = ''; // Clear the sidebar


  // If logDates in state is not empty, use it instead of fetching
  if (state.logDates.length > 0) {
    renderLogDates();
    return;
  }
  // Proceed to fetch log dates if state.logDates is empty
  getLogDates()
}

// This function fetches log dates and updates the state and UI
function getLogDates() {
  // Fetch log dates
  console.log("fetch dates");
  const endpoint = state.host + '/log';
  const headers = {
    'Authorization': `Bearer ${state.token}` // Use actual token
  };
  console.log("call data: ", {endpoint, headers});

  fetch(endpoint, { headers: headers })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(dates => {
      // Update state with the fetched dates
      state.logDates = dates.map(dateObj => new Date(dateObj.created).toDateString());
      renderLogDates();
    })
    .catch(error => {
      console.error('Error fetching log dates:', error);
    });
}

// This function renders log dates from state to the sidebar
function renderLogDates() {
  // Create a new Set to store unique dates from state.logDates
  const uniqueDates = new Set(state.logDates);

  // Convert the Set to an array and sort it in descending order
  const sortedUniqueDates = Array.from(uniqueDates).sort((a, b) => new Date(b) - new Date(a));

  // Create sidebar elements for each unique date
  sortedUniqueDates.forEach(uniqueDate => {
    const dateElement = document.createElement('div');
    dateElement.textContent = uniqueDate;
    dateElement.className = 'sidebarDate';
    dateElement.addEventListener('click', () => fetchLogDetails(uniqueDate));
    sidebar.appendChild(dateElement);
  });

  // Create and append the refresh button
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh Log Dates';
    refreshButton.className = 'sidebarButton';
    refreshButton.addEventListener('click', getLogDates);
    sidebar.appendChild(refreshButton);
}

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
  const endpoint = state.host + `/log?conditions=${encodedConditions}`;
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

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('logIcon').addEventListener('click', fetchLogDates);
  document.getElementById('settingsIcon').addEventListener('click', loadSettings);

  // Fetch log dates on initial load
  loadSettings();
});