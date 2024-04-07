import {setState, getState} from './state.js'
import {loadSettings,createButton} from './index.js'

const state = getState()

function askForPassword() {
    console.log("permission alert called")
    return new Promise((resolve) => {
        const password = window.prompt("Please enter your password:");
        resolve(password);
    });
}

function reloadSettings(users) {
    console.log('reload called')
    // console.log('users:', users);

    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';

    if (state.isDev) {
        const devSettingsButton = createButton('Developer Settings', 'devSettings', 'sidebarButton', devFunctionsHandler);
        sidebar.appendChild(devSettingsButton);
        const companySettingsButton = createButton(state.company, 'compSettingsBtn', 'sidebarButton company', companySettingsHandler);
        sidebar.appendChild(companySettingsButton);
    }

    if (users.length === 0) {
        sidebar.appendChild(createNoUsersMessage());
    } else {
        users.forEach(user => {
            try {
                const userButton = createButton(user.username, null, 'sidebarButton user', () => userSettingsHandler(user));
                userButton.dataset.userAccess = user.access;
                sidebar.appendChild(userButton);
            } catch (error) {
                console.error('Error creating button for user:', user, error);
            }
        });
    }
}

//USERS
export async function getUsers() {
    console.log('getting users');
    console.log('state: ', state);

    try {
        const response = await fetch(state.host + '/companyUsers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + state.token
            },
        });

        if (!response.ok) {
            // If the response is not okay, parse it as JSON to get the error message
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); // Convert response to JSON
        //console.log('Users retrieved successfully:', data.userArray);
        reloadSettings(data.userArray); // Call reloadSettings with the retrieved data
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error.message);
        // Handle errors, such as by displaying a message to the user
    }
}

export function userSettingsHandler(user) {
    console.log(`User Settings`);

    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    // Create the user name header 
    const userName = document.createElement('h1');
    userName.className = 'logH1';
    userName.textContent = user.username;

    // Append user name to logContent
    logContent.appendChild(userName);

    // button to reset password
    const resetButton = createButton('reset password', null, 'formButton', () => handlePasswordReset(user));
    logContent.appendChild(resetButton);

    if (state.isDev) {
        // button to send verification email
        const verifyButton = createButton('resend verification email', null, 'formButton', () => handleVerifyEmail(user));
        logContent.appendChild(verifyButton);

        // button to lock user
        const lockButton = createButton('lock user', null, 'formButton', () => handleLockUser(user));
        logContent.appendChild(lockButton);

        // button to delete user
        const deleteButton = createButton('delete user', null, 'formButton', () => handleDeleteUser(user));
        logContent.appendChild(deleteButton);

        // button to get token (dev only) needed to create log access in user projects
        const tokenButton = createButton('get user token', null, 'formButton', () => generateUserToken(user));
        logContent.appendChild(tokenButton);
    }
}


function handlePasswordReset(user) {
    // call endpoint to reset user password
}

function handleVerifyEmail(user) {
    // call endpoint to send/resend verification email

}

function handleLockUser(user) {
    // call endpoint to lock user
}

function handleDeleteUser(user) {
    // call endpoint to delete user

}


//COMPANY
async function loadCompanyHandler(event) {
    console.log('load company clicked');
    // console.log(event);
    event.preventDefault(); // Prevent the default form submission

    const logContent = document.getElementById('log-content');    
    
    // Check if password is available
    if (!state.password) {
        // if this is a reset, which is likely given the password was cleared, clear apiKey
        // setState('apiKey', 'Replace', "");
        // setState('company', 'Replace', "");
        // Since state.password is empty, ask for it again
        state.password = await askForPassword();
        if (!state.password) {
            alert("Password is required to proceed.");
            return; // Exit the function if no password was provided
        }
    }

    // Extract form data
    const formData = new FormData(event.target);
    const requestData = {
        company: formData.get('companyName'),
        username: state.userName,
        password: state.password
    };
    console.log(`requestData: ${JSON.stringify(requestData)}`);

    fetch(state.host + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Convert response to JSON
    })
    .then(responseData => {
        console.log('response data: ', responseData)
        // Check if the response has a token
        if (responseData.token) {
            setState('token', 'Replace', responseData.token);
        }

        // Check if the response has a company and it's not null
        if (responseData.apiKey != null) {
            // If an API key exists, replace the necessary state values
            setState('apiKey', 'Replace', responseData.apiKey);
            setState('company', 'Replace', requestData.company);
            setState('password', 'Replace', "");
        } else {
            // If no company found, prompt the user to create a new company
            const wantsToCreateCompany = window.confirm("No company found. Do you want to create a new company?");
            if (wantsToCreateCompany) {
                // User chose to create a new company
                console.log('newCompanySelected', JSON.stringify(requestData));
                createNewCompany(requestData);
            } else {
                // User chose not to create a new company, cancel the process
                console.log("Process cancelled by the user.");
                setState('password', 'Replace', "");
            }
        }
        
        const accessLevel = responseData.userAccess;
        const isDev = accessLevel==="dev";
        const userReset = responseData.userReset;

        setState('isDev', 'Replace', isDev);
        setState('accessLevel', 'Replace', accessLevel);

        console.log('load state: ', state);

        loadSettings()

    })
    .catch(error => {
        // Display error message 
        // Check if there is an existing responseDiv and remove it
        const existingResponseDiv = logContent.querySelector('.apiResponse');
        if (existingResponseDiv) {
            logContent.removeChild(existingResponseDiv);
        }
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.className = 'apiResponse';
        logContent.appendChild(errorDiv);
        console.error('There was a problem with the fetch operation:', error.message);
    });
};

function createNoUsersMessage() {
    const message = document.createElement('p');
    message.textContent = 'No users available';
    return message;
}

function companySettingsHandler() {
    console.log('loading company setting');
    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    // Header for state.Company
    const header = document.createElement('h1');
    header.className = 'logH1';
    header.textContent = state.company;

    // Button lock access
    const lockButton = createButton('lock company', null, 'formButton', handleLockCompany);

    // Button summarize access
    const summarizeButton = createButton('summarize access', null, 'formButton', handleSummarizeAccess);

    logContent.appendChild(header);
    logContent.appendChild(lockButton);
    logContent.appendChild(summarizeButton);
}

function handleLockCompany() {
    // set the company to a locked state
    // TODO: when locked api calls are refused
    // TODO: visual indicator that company is locked

}

function handleSummarizeAccess() {
    // summarize access type and counts for last month
    // present to user

}

// DEVELOPER SETTINGS
// forms to display developer functions
export function devSettingsHandler() {
    console.log('dev settings handler')
    const logContent = document.getElementById('log-content');
    const existingForm = document.getElementById('companyInfo');
    if (!state.company || !state.apiKey) {
        console.log('company info form')
        if(!existingForm) {
        //init the company form
        const form = document.createElement('form');
        form.id = 'companyInfo';
        form.addEventListener('submit', loadCompanyHandler);

        // Create the company name (email) input
        const companyNameInput = document.createElement('input');
        companyNameInput.type = 'text';
        companyNameInput.name = 'companyName';
        companyNameInput.className = 'formInput';
        companyNameInput.placeholder = '+ Company Name';
        companyNameInput.required = true;

        // Create the submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'formButton';
        submitButton.textContent = 'Submit';
        form.appendChild(companyNameInput);
        form.appendChild(submitButton);

        logContent.appendChild(form);
        }
    } else {  
        console.log('dev functions load'); 

        // load dev settingds
        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = '';
        // load dev functions button
        const devSettingsButton = createButton('Developer Settings', 'devSettings', 'sidebarButton', devFunctionsHandler);
        sidebar.appendChild(devSettingsButton);
        // load company functions button
        const companySettingsButton = createButton(state.company, 'compSettingsBtn', 'sidebarButton company', companySettingsHandler);
        sidebar.appendChild(companySettingsButton);
        // load dev functions
        devFunctionsHandler();
    }
};

export function devFunctionsHandler() {
    console.log('dev functions handler');
    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    // Create the first form for company creation/change state
    const formCompany = document.createElement('form');
    formCompany.addEventListener('submit', loadCompanyHandler);

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
    companyButton.textContent = 'Switch Company' ;

    // Append inputs and button to the first form
    formCompany.appendChild(companyNameInput1);
    formCompany.appendChild(companyButton);

    // Append formCompany to the log-content div
    logContent.appendChild(formCompany);

    // Append formUser only if company exists in state
    if (state.company && state.company.length > 0) {
        // get the users of this company// Call getUsers to retrieve and display the users
        getUsers().then(() => {
            console.log('Users fetched and displayed.');
        }).catch(error => {
            console.error('Error fetching users:', error.message);
            // Handle errors, such as by displaying a message to the user
        });

        const spacer = document.createElement('div');
        spacer.style.height = '30px';

        // Create the second form for user creation
        const formUser = document.createElement('form');
        formUser.addEventListener('submit', createUserHandler);

        // Create the company name input for the second form
        const companyNameInput2 = document.createElement('input');
        companyNameInput2.type = 'text';
        companyNameInput2.name = 'companyName';
        companyNameInput2.className = 'formInput';
        companyNameInput2.placeholder = 'Company Name';
        companyNameInput2.value = state.company;

        // Create the user name (email) input
        const userNameInput = document.createElement('input');
        userNameInput.type = 'text';
        userNameInput.name = 'userName';
        userNameInput.className = 'formInput';
        userNameInput.placeholder = 'user@name.com';

        // Create the password input
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.name = 'password';
        passwordInput.className = 'formInput';
        passwordInput.placeholder = 'Password';

        // Create the access level dropdown
        const accessLevelSelect = document.createElement('select');
        accessLevelSelect.name = 'accessLevel';
        accessLevelSelect.className = 'formSelect';

            // Option for standard access
            const standardOption = document.createElement('option');
            standardOption.value = 'standard';
            standardOption.textContent = 'Standard';
            accessLevelSelect.appendChild(standardOption);

            // Option for admin access
            const adminOption = document.createElement('option');
            adminOption.value = 'admin';
            adminOption.textContent = 'Admin';
            accessLevelSelect.appendChild(adminOption);

            // Option for dev access
            const devOption = document.createElement('option');
            devOption.value = 'dev';
            devOption.textContent = 'Dev';
            accessLevelSelect.appendChild(devOption);

        // Create the submit button for the second form
        const userButton = document.createElement('button');
        userButton.type = 'submit';
        userButton.className = 'formButton';
        userButton.textContent = 'Create User';

        // Append inputs and button to the second form
        formUser.appendChild(companyNameInput2);
        formUser.appendChild(userNameInput);
        formUser.appendChild(passwordInput);
        formUser.appendChild(accessLevelSelect);
        formUser.appendChild(userButton);

        // Append formUser to the log-content div
        logContent.appendChild(spacer);
        logContent.appendChild(formUser);
    }
}

export async function createNewCompany(data) {
    console.log("create company was clicked")
    console.log('Request data:', JSON.stringify(data));
    fetch(state.host + '/createCompany', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Convert response to JSON
    })
    .then(responseData => {
        // Set company and token into state
        setState('company', 'Replace', data.company);
        setState('apiKey', 'Replace', data.apiKey);
    
        // Run devFunctionsHandler (assuming it's defined and handles the response data)
        devFunctionsHandler(responseData);
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

export async function createUserHandler(event) {
    event.preventDefault(); // Prevent the default form submission
    console.log('Creating User...');

    const logContent = document.getElementById('log-content');

    // Extract form data
    const formData = new FormData(event.target);
    const data = {
        apiKey: state.apiKey, //needs apiKey not company name
        username: state.devCredentials.username,
        password: state.devCredentials.password,
        newUserName: formData.get('userName'),
        newPassword: formData.get('password'),
        accessLevel: formData.get('accessLevel'),
    };

    try {
        // Make the API call to create the user
        const response = await fetch(state.host + '/createUser', {
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

        // After successful user creation, get updated user data and redraw the display
        const users = await getUsers(); // Wait for getUsers to complete
        reloadSettings(users); // Reload the settings with the updated user data
    } catch (error) {
        // Display error message
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.className = 'apiError';
        logContent.appendChild(errorDiv);

        console.error('There was a problem with the fetch operation:', error);
    }
}

export async function generateUserToken(user) {
    console.log('Generate Token clicked');

    const logContent = document.getElementById('log-content');

    fetch(state.host + '/user_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + state.token
        },
        body: JSON.stringify({
            'username': user.username,
            'access': user.access
        }),
    })
    .then( async response => {
        if (!response.ok) {
            const errorResponse = await response.json(); // Convert response to JSON
            throw new Error(errorResponse.message);
        }
        const info = await response.json(); // Convert response to JSON
        // Check if there is an existing responseDiv and remove it
        const existingResponseDiv = logContent.querySelector('.apiResponse');
        if (existingResponseDiv) {
            logContent.removeChild(existingResponseDiv);
        }
        const responseDiv = document.createElement('div');
        responseDiv.innerHTML = info.message + '<br>' + info.token; // Using innerHTML to include HTML line break
        responseDiv.className = 'apiResponse';
        logContent.appendChild(responseDiv);
    })
    .catch(error => {
        // Display error message
        const existingResponseDiv = logContent.querySelector('.apiResponse');
        if (existingResponseDiv) {
            logContent.removeChild(existingResponseDiv);
        }
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message}`; // Display the message from the server
        errorDiv.className = 'apiResponse';
        logContent.appendChild(errorDiv);

        console.error('There was a problem with the fetch operation:', error.message);
    });

}