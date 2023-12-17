import {setState, getState} from './state.js'

const state = getState()

async function getUsers() {
    console.log('getting company users');

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

function reloadSettings(users) {
    console.log('reload called')
    // console.log('users:', users);

    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';

    const devSettingsButton = createButton('Developer Settings', 'devSettings', 'sidebarButton', developerSettingsHandler);
    sidebar.appendChild(devSettingsButton);

    const companySettingsButton = createButton(state.company, 'compSettingsBtn', 'sidebarButton.company', companySettingsHandler);
    sidebar.appendChild(companySettingsButton);

    if (users.length === 0) {
        sidebar.appendChild(createNoUsersMessage());
    } else {
        users.forEach(user => {
            try {
                const userButton = createButton(user.username, null, 'sidebarButton', () => userSettingsHandler(user));
                userButton.dataset.userAccess = user.access;
                sidebar.appendChild(userButton);
            } catch (error) {
                console.error('Error creating button for user:', user, error);
            }
        });
    }
}

function createButton(text, id, className, eventHandler) {
    const button = document.createElement('button');
    button.textContent = text;
    if (id) button.id = id;
    button.className = className;
    button.addEventListener('click', eventHandler);
    return button;
}

function createNoUsersMessage() {
    const message = document.createElement('p');
    message.textContent = 'No users available';
    return message;
}

function companySettingsHandler() {
    // header state.Company
    // button lock access
    // button summarize access
}

function userSettingsHandler(user) {
    console.log('User Settings clicked');
    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    // Create the user name header 
    const userNameInput = document.createElement('input');
    userNameInput.type = 'text';
    userNameInput.name = 'userName';
    userNameInput.className = 'formInput';
    // make this uneditable
    userNameInput.required = true;
    userNameInput.value = user.username;

    // button to reset password
    // button to send verification email
    // button to lock user
    // button to delete user
    // button to get token (dev only) needed to create log access in user projects


}

// developer log in
export function developerSettingsHandler() {
    // console.log('state: ', state)
    if (!state.devCredentials.username) {
        console.log('Developer Settings clicked');
        // Clear the log-content div
        const logContent = document.getElementById('log-content');
        logContent.innerHTML = '';

        // Create the form element
        const form = document.createElement('form');
        form.addEventListener('submit', handleDevSubmit);

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
        form.appendChild(companyNameInput);
        form.appendChild(userNameInput);
        form.appendChild(passwordInput);
        form.appendChild(submitButton);

        // Append the form to the log-content div
        logContent.appendChild(form);
    } else {
        // If state.devCredentials is not null, run devFunctionsHandler
        devFunctionsHandler();
    }
} 

export function handleDevSubmit(event) {
    console.log('dev submission clicked');
    event.preventDefault(); // Prevent the default form submission

    const logContent = document.getElementById('log-content');

    // Extract form data
    const formData = new FormData(event.target);
    const companyName = formData.get('companyName');
    const requestData = {
        username: formData.get('userName'),
        password: formData.get('password'),
        company: formData.get('companyName')
    };

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
            setState('company', 'Replace', companyName);
            setState('apiKey', 'Replace', responseData.apiKey);
        }
        setState('devCredentials', 'Replace', {username: requestData.username, password: requestData.password})

        // Call developerHandler with the response data
        devFunctionsHandler();
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
    console.log('state: ', state);
}
//on success loads developer functions
//
//
// forms to display developer functions
export function devFunctionsHandler() {
    console.log('dev functions handler');
    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    // Create the first form for company creation/change state
    const formCompany = document.createElement('form');
    formCompany.addEventListener('submit', updateDevFunctionsHandler);

    // Create the company name input for the first form
    const companyNameInput1 = document.createElement('input');
    companyNameInput1.type = 'text';
    companyNameInput1.name = 'companyName';
    companyNameInput1.className = 'formInput';
    companyNameInput1.placeholder = 'Company Name';
    companyNameInput1.required = true;

    // // Check if company exists in state and update input value
    // if (state.company) {
    //     companyNameInput1.value = state.company;
    // }

    // Create the submit button for the first form
    const companyButton = document.createElement('button');
    companyButton.type = 'submit';
    companyButton.className = 'formButton';
    companyButton.textContent = state.company ? 'Switch Company' : 'Create Company';

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
        logContent.appendChild(formUser);
    }
}

// submit company form. 
export async function updateDevFunctionsHandler(event) {
    console.log("create/update company was clicked")
    event.preventDefault(); // Prevent the default form submission

    const logContent = document.getElementById('log-content');

    // Extract form data
    console.log("state: ", state)
    const formData = new FormData(event.target);
    const data = {
        company: formData.get('companyName'), // Use the 'name' attribute of the input field
        DEVun: state.devCredentials.username,
        DEVpw: state.devCredentials.password,
    };
    console.log("company create/update Data: ", data)

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
        // Make the API call
        const response = await fetch(state.host+'/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        console.log(response)
        if (!response.ok) { // Check for response.ok instead of a specific status
            // Try to parse the error response body to get the error message
            const errorResponse = await response.json(); // Assumes the server responds with JSON-formatted error
            throw new Error(errorResponse.message || 'Unknown error occurred');
        }

        const responseData = await response.json(); // Convert response to JSON

        // If response is OK, Display success
        // Check if there is an existing responseDiv and remove it
        const existingResponseDiv = logContent.querySelector('.apiResponse');
        if (existingResponseDiv) {
            logContent.removeChild(existingResponseDiv);
        }

        // Create a new responseDiv
        const responseDiv = document.createElement('div');
        responseDiv.textContent = `Created: ${responseData.message}`; // Assuming responseData contains a message field
        responseDiv.className = 'apiResponse';
        logContent.appendChild(responseDiv);
    } catch (error) {
        // Display error message
        // Check if there is an existing responseDiv and remove it
        const existingResponseDiv = logContent.querySelector('.apiResponse');
        if (existingResponseDiv) {
            logContent.removeChild(existingResponseDiv);
        }

        // Create a new responseDiv
        const errorDiv = document.createElement('div');
        errorDiv.textContent = `Error: ${error.message || error}`;
        errorDiv.className = 'apiResponse';
        logContent.appendChild(errorDiv);

        console.error('There was a problem with the fetch operation:', error);
    }
}

export function generateTokenHandler() {
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

export async function handleFormSubmit(event) {
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
        const response = await fetch(state.host+'/generateToken', {
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

export function loadSettings() {
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

    // // Create the "Generate Token" button
    // const generateTokenButton = document.createElement('button');
    // generateTokenButton.textContent = 'Generate Token';
    // generateTokenButton.id = 'generateToken';
    // generateTokenButton.className = 'sidebarButton';
    // generateTokenButton.addEventListener('click', generateTokenHandler);
    // sidebar.appendChild(generateTokenButton);

    developerSettingsHandler()
}