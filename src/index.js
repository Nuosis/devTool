import {setState, getState} from './state.js'
import {devSettingsHandler, userSettingsHandler} from './settings.js'
import {createLogIcon} from './log.js'

const state = getState()

export function createButton(text, id, className, eventHandler) {
  const button = document.createElement('button');
  button.textContent = text;
  if (id) button.id = id;
  button.className = className;
  button.addEventListener('click', eventHandler);
  return button;
}

function initSettings() {
  // Clear out the current elements in the sidebar and main divs
  const sidebar = document.getElementById('sidebar');
  const logContent = document.getElementById('log-content');

  // Create the "Log In" button
  const devSettingsButton = document.createElement('button');
  devSettingsButton.textContent = 'Log In';
  devSettingsButton.id = 'loginButton';
  devSettingsButton.className = 'sidebarButton';
  devSettingsButton.addEventListener('click', loadSettings);
  sidebar.appendChild(devSettingsButton);

  //init the log in form
  const form = document.createElement('form');
  form.addEventListener('submit', handleLogInSubmit);

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
  submitButton.textContent = 'Log In';

  // Append inputs and button to the form
  // form.appendChild(companyNameInput);
  form.appendChild(userNameInput);
  form.appendChild(passwordInput);
  form.appendChild(submitButton);

  // Append the form to the log-content div
  logContent.appendChild(form);
}

function handleLogInSubmit(event) {
  console.log('login submission clicked');
  event.preventDefault(); // Prevent the default form submission

  const logContent = document.getElementById('log-content');

  // Extract form data
  const formData = new FormData(event.target);
  const requestData = {
      username: formData.get('userName'),
      password: formData.get('password')
  };

  setState('userName', 'Replace', requestData.username);
  setState('password', 'Replace', requestData.password);

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
          // setState('company', 'Replace', companyName);
          setState('apiKey', 'Replace', responseData.apiKey);
      }
      const accessLevel = responseData.userAccess;
      const isDev = accessLevel==="dev";
      const isAdmin = isDev || accessLevel === "admin";
      const userReset = responseData.userReset;

      setState('isDev', 'Replace', isDev);
      setState('isAdmin', 'Replace', isAdmin);
      setState('accessLevel', 'Replace', accessLevel);

      if (responseData.company != null) {
        setState('company', 'Replace', responseData.company)
      }

      console.log('login state: ', state); 
      // reveil the log icon 
      createLogIcon();
      // load settings 
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
}

export function loadSettings() {
  console.log('loading Settings');
  // Clear out the current elements in the sidebar and main divs
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = '';

  if(state.isDev) {
    // load dev settings
    devSettingsHandler();
  } else {
    // Create the "Log In" button
    const accountButton = document.createElement('button');
    accountButton.textContent = 'Account';
    accountButton.id = 'accountButton';
    accountButton.className = 'sidebarButton';
    accountButton.addEventListener('click', () => loadSettings());
    sidebar.appendChild(accountButton);

    // load user settings
    const params = {username: state.userName, accessLevel: state.accessLevel}
    userSettingsHandler(params)
  }
}

// ON LOAD
document.addEventListener('DOMContentLoaded', function() {
  // document.getElementById('logIcon').addEventListener('click', fetchLogDates);
  document.getElementById('settingsIcon').addEventListener('click', loadSettings);
  initSettings()

});