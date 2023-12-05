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
    form.addEventListener('submit', handleDevSubmit);

    // Create the user name (email) input
    const userNameInput = document.createElement('input');
    userNameInput.type = 'text';
    userNameInput.name = 'userName';
    userNameInput.className = 'formInput';
    userNameInput.placeholder = 'Dev Name';
    userNameInput.required = true;

    // Create the password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.className = 'formInput';
    passwordInput.placeholder = 'Password';
    passwordInput.required = true;

    // Create the submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'formButton';
    submitButton.textContent = 'Log In';

    // Append inputs and button to the form
    form.appendChild(userNameInput);
    form.appendChild(passwordInput);
    form.appendChild(submitButton);

    // Append the form to the log-content div
    logContent.appendChild(form);
  } 

  function handleDevSubmit(event) {
    console.log('dev submission clicked');
    event.preventDefault(); // Prevent the default form submission

    const logContent = document.getElementById('log-content');

    // Extract form data
    const formData = new FormData(event.target);
    const data = {
        username: formData.get('userName'),
        password: formData.get('password')
    };
    //console.log('formData: ',data);

    // Make the API call
    fetch('http://localhost:4040/dev', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
        if (response.status !== 200) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Convert response to JSON
    })
    .then(data => {
        // If response is OK, call developerHandler
        developerHandler(data);
    })
    .catch(error => {
        // Display error message
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.className = 'apiError';
        logContent.appendChild(errorDiv);

        console.error('There was a problem with the fetch operation:', error);
    });
  }

  function developerHandler() {
    console.log('Developer Settings clicked');
    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    // Create the first form for company creation
    const formCompany = document.createElement('form');
    formCompany.addEventListener('submit', createCompanyHandler);

    // Create the company name input for the first form
    const companyNameInput1 = document.createElement('input');
    companyNameInput1.type = 'text';
    companyNameInput1.name = 'companyName';
    companyNameInput1.className = 'formInput';
    companyNameInput1.placeholder = 'Company Name';
    companyNameInput1.required = true;

    // Create the submit button for the first form
    const companyButton = document.createElement('button');
    companyButton.type = 'submit';
    companyButton.className = 'formButton';
    companyButton.textContent = 'Create Company';

    // Append inputs and button to the first form
    formCompany.appendChild(companyNameInput1);
    formCompany.appendChild(companyButton);

    // Create the second form for user creation
    const formUser = document.createElement('form');
    formUser.addEventListener('submit', createUserHandler);

    // Create the company name input for the second form
    const companyNameInput2 = document.createElement('input');
    companyNameInput2.type = 'text';
    companyNameInput2.name = 'companyName';
    companyNameInput2.className = 'formInput';
    companyNameInput2.placeholder = 'Company Name';

    // Create the user name (email) input
    const userNameInput = document.createElement('input');
    userNameInput.type = 'text';
    userNameInput.name = 'userName';
    userNameInput.className = 'formInput';
    userNameInput.placeholder = 'Dev Name';

    // Create the password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.className = 'formInput';
    passwordInput.placeholder = 'Password';

    // Create the submit button for the second form
    const userButton = document.createElement('button');
    userButton.type = 'submit';
    userButton.className = 'formButton';
    userButton.textContent = 'Create User';

    // Append inputs and button to the second form
    formUser.appendChild(companyNameInput2);
    formUser.appendChild(userNameInput);
    formUser.appendChild(passwordInput);
    formUser.appendChild(userButton);

    // Append both forms to the log-content div
    logContent.appendChild(formCompany);
    logContent.appendChild(formUser);
  }

  // Ensure createCompanyHandler and createUserHandler functions are defined
  async function createCompanyHandler(event) {
    event.preventDefault(); // Prevent the default form submission

    const logContent = document.getElementById('log-content');

    // Extract form data
    const formData = new FormData(event.target);
    const data = {
        company: formData.get('companyName'), // Use the 'name' attribute of the input field
    };

    try {
        // Make the API call
        const response = await fetch('http://localhost:4040/createCompany', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.status !== 200) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json(); // Convert response to JSON

        // If response is OK, Display success
        const responseDiv = document.createElement('div');
        responseDiv.textContent = `Created: ${responseData.company}`;
        responseDiv.className = 'apiResponse';
        logContent.appendChild(responseDiv);
    } catch (error) {
        // Display error message
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.className = 'apiError';
        logContent.appendChild(errorDiv);

        console.error('There was a problem with the fetch operation:', error);
    }
  } 

  async function createUserHandler(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log('Creating User...');

    const logContent = document.getElementById('log-content');

    // Extract form data
    const formData = new FormData(event.target);
    const data = {
        company: formData.get('companyName'),
        username: formData.get('userName'),
        password: formData.get('password'),
    };

    try {
        // Make the API call
        const response = await fetch('http://localhost:4040/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.status !== 200) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json(); // Convert response to JSON

        // If response is OK, Display success
        const responseDiv = document.createElement('div');
        responseDiv.textContent = `Created: ${responseData.username}`; // Assuming responseData contains a username field
        responseDiv.className = 'apiResponse';
        logContent.appendChild(responseDiv);
    } catch (error) {
        // Display error message
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.className = 'apiError';
        logContent.appendChild(errorDiv);

        console.error('There was a problem with the fetch operation:', error);
    }
  }

  function generateTokenHandler() {
      console.log('Generate Token clicked');
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
      companyNameInput.className = 'formInput';
      companyNameInput.placeholder = 'Company Name';
      companyNameInput.required = true;

      // Create the user name (email) input
      const userNameInput = document.createElement('input');
      userNameInput.type = 'text';
      userNameInput.name = 'userName';
      userNameInput.className = 'formInput';
      userNameInput.placeholder = 'User Name';
      userNameInput.required = true;

      // Create the password input
      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.name = 'password';
      passwordInput.className = 'formInput';
      passwordInput.placeholder = 'Password';
      passwordInput.required = true;

      // Create the submit button
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = 'formButton';
      submitButton.textContent = 'Generate Token';

      // Append inputs and button to the form
      form.appendChild(companyNameInput);
      form.appendChild(userNameInput);
      form.appendChild(passwordInput);
      form.appendChild(submitButton);

      // Append the form to the log-content div
      logContent.appendChild(form);
  }

  async function handleFormSubmit(event) {
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

    try {
        // Make the API call
        const response = await fetch('http://localhost:4040/generateToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.status !== 200) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json(); // Convert response to JSON

        // Display the response
        const responseDiv = document.createElement('div');
        const responseMessage = JSON.stringify(responseData, null, 2);
        console.log('Response JSON:', responseMessage);

        // Check if the message property exists in the response data
        if (responseData.message) {
            console.log('Message:', responseData.message);
            responseDiv.textContent = responseData.message;
        } else {
            responseDiv.textContent = responseMessage;
        }

        responseDiv.className = 'apiResponse';
        logContent.appendChild(responseDiv);
    } catch (error) {
        // Display error message
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.className = 'apiError';
        logContent.appendChild(errorDiv);

        console.error('There was a problem with the fetch operation:', error);
    }
  }

}


