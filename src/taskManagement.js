import {setState, getState} from './state.js'
import {createButton} from './index.js'

const state = getState()


/**
 * PROJECTS
 */
async function getProjects(){
    // TODO
    // props token (to get company info)
    // limit to pm if isAdmin. limit to projects with tasked assign to if not isAdmin, do not limit if isDev
    // needs to return project name, id, projectManagerId, {tasks}
    // set result in state
}

//PROJECT SPECIFIC FUNCTIONS
function loadProject(project) {
    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    setState('projectDetails', 'Replace', project);
    getTasks(project.id)
    //project tasks are now filtered and sorted into their lanes in state
    function createTaskElement(task) {
        const taskElement = document.createElement('p'); // Use a different variable name to avoid conflict
        taskElement.draggable = true; // Correct attribute name
        taskElement.textContent = task.taskName; // Use textContent or innerText
        taskElement.id = task.id;
        taskElement.className = "task";
        taskElement.dataset.description = task.description;

        // Add dragstart event listener
        taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', taskElement.id);
            taskElement.classList.add('is-dragging');
        });

        // Add dragend event listener
        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('is-dragging');
        });
        return taskElement
    };

    const insertTaskInLane = (laneId, taskId) => {
        const taskElement = document.getElementById(taskId);
        const lane = document.getElementById(laneId);
        const allTasksInLane = lane.querySelectorAll('.task');
    
        // Assuming the task has a property indicating its current state (e.g., data-status)
        const oldStatus = taskElement.getAttribute('data-status');
        const newStatus = laneId.replace('lane-', ''); // e.g., converting "lane-projectActive" to "projectActive"
    
        // Remove task from its old array in the state
        state[oldStatus] = state[oldStatus].filter(task => task.id !== taskId);
    
        // Find the task in the state based on taskId
        const task = state[oldStatus].find(task => task.id === taskId) || {};
    
        // Update the task's status based on the lane it was dropped into
        task.status = newStatus;
        task.order = newIndex;
        updateTask(task)
    
        const nextTask = Array.from(lane.children).find(task => task.offsetTop > dropPositionY);

        if (nextTask) {
            lane.insertBefore(taskElement, nextTask);
        } else {
            lane.appendChild(taskElement);
        }
    
        // Update task status attribute to reflect its new lane
        taskElement.setAttribute('data-status', newStatus);
    
    };

    //Load Tasks In Sidebar
    console.log('loading tasks');
    // returns taskName, description, status, id

        const kanban = document.createElement('div');
        kanban.className="board"
            const form = document.createElement('form');
            form.id="task-form"
            form.addEventListener('submit', newTask);
                // Create the task input
                const newTaskInput = document.createElement('input');
                newTaskInput.type = 'text';
                newTaskInput.name = 'userName';
                newTaskInput.id = 'task-input';
                newTaskInput.className = 'formInput';
                newTaskInput.placeholder = 'New Task...';
                newTaskInput.required = true;
                form.appendChild(newTaskInput)
            kanban.appendChild(form);

            const lanes = document.createElement('div');
            lanes.className="lanes"
                const swimlane = document.createElement('div');
                swimlane.id="task-lane";
                swimlane.className="swim-lane";
                swimlane.addEventListener('dragover', (e) => {
                    e.preventDefault(); // Necessary to allow dropping
                    // Add visual feedback if desired
                });
                swimlane.addEventListener('drop', (e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData('text/plain');
                    insertTaskInLane(swimlane, taskId);
                    // You may need to implement logic to move the task element to this lane in the DOM
                    // and potentially update the task's status in your state management
                });
                    const swimlaneTaskHeading = document.createElement('h3');
                    swimlaneTaskHeading.className="heading"
                    swimlane.appendChild(swimlaneTaskHeading)

                    state.projectTasks.forEach(task => {
                        // returns taskName, description, status, id
                        try {
                            const taskElement = createTaskElement(task);
                            swimlane.appendChild(taskElement);
                        } catch (error) {
                            console.error('Error creating lane for task:', task, error);
                        }  
                    });
                lanes.appendChild(swimlane)

                const swimlaneActive = document.createElement('div');
                swimlaneActive.id="tasks-lane";
                swimlaneActive.className="swim-lane";
                    const swimlaneActiveTaskHeading = document.createElement('h3');
                    swimlaneActiveTaskHeading.className="heading"
                    swimlaneActive.appendChild(swimlaneActiveTaskHeading)

                    state.projectActive.forEach(task => {
                        // returns taskName, description, status, id
                        try {
                            const taskElement = createTaskElement(task);
                            swimlaneActive.appendChild(taskElement);
                        } catch (error) {
                            console.error('Error creating lane for task:', task, error);
                        }  
                    });
                lanes.appendChild(swimlaneActive)

                const swimlaneComplete = document.createElement('div');
                swimlaneComplete.id="tasks-lane";
                swimlaneComplete.className="swim-lane";
                    const swimlaneCompleteTaskHeading = document.createElement('h3');
                    swimlaneCompleteTaskHeading.className="heading"
                    swimlaneComplete.appendChild(swimlaneCompleteTaskHeading)

                    state.projectComplete.forEach(task => {
                        // returns taskName, description, status, id
                        try {
                            const taskElement = createTaskElement(task);
                            swimlaneComplete.appendChild(taskElement);
                        } catch (error) {
                            console.error('Error creating lane for task:', task, error);
                        }  
                    });
                lanes.appendChild(swimlaneComplete)
            kanban.appendChild(lanes);
        logContent.appendChild(kanban);
}
function deleteProject(){
    // TODO
}
function updateProject(){
    // TODO
}

/**
 * TASKS
 */
async function getTasks(projectId){
    // return taskName, description, status, id
    // map from projectDetails in state
    // reorder by order value
}

//TASK SPECIFIC FUNCTIONS
function newTask(){
    // returns taskName, description, status, id, order, projectId, assignedToId
    // status must be task, active, complete
}
function deleteTask(){
    // TODO
}
function updateTask(task){
    // TODO
    // requires id. all other keys provided are considered update keys and values
}


export async function initTaskManagment(){
    console.log('initializing task management');
    // Clear the sidebar divs
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = '';
    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    //Load Projects In Sidebar
    console.log('loading projects');
    const projects = getProjects()
    if (projects.length === 0) {   
        const message = document.createElement('projectMessage');
        message.textContent = 'No projects available';
        sidebar.appendChild(message);
    } else {
        projects.forEach(project => {
            /** TODO
             * Limit
             * isDev: false
             * isAdmin: to projects where user is PM
             * Else: to projects where tasks are assigned
             */

            try {
                const projectButton = createButton(project.projectName, null, 'sidebarButton user', () => loadProject(project));
                // projectButton.dataset.userAccess = user.access;
                sidebar.appendChild(projectButton);
            } catch (error) {
                console.error('Error creating button for project:', project, error);
                const message = document.createElement('projectMessage');
                message.textContent = `Error creating button for ${project}: ${error}`;
                sidebar.appendChild(message);
                return
            }
        });
    }

    //  create project button
    const createProjectButton = document.createElement('button');
    createProjectButton.textContent = 'New Project';
    createProjectButton.id = 'createProjectButton';
    createProjectButton.className = 'sidebarButton';
    createProjectButton.addEventListener('click', () => createProject());
    sidebar.appendChild(createProjectButton);


}



