import {setState, getState} from './state.js'
import {createButton} from './index.js'

const state = getState()

async function getProjects(){
    // props token (to get company info)
    // limit to pm if isAdmin. limit to projects with tasked assign to if not isAdmin, do not limit if isDev
    // needs to return project name, id, projectManagerId, {tasks}
    // set result in state
}

function loadProject(project) {
    // Clear the log-content div
    const logContent = document.getElementById('log-content');
    logContent.innerHTML = '';

    setState('projectDetails', 'Replace', project);
    getTasks(project.id)
    //project tasks are now filtered and sorted into their lanes in state

    //Load Tasks In Sidebar
    console.log('loading tasks');
    const tasks = getTasks(project.id)
    // returns taskName, description, status, id

        const kanban = document.createElement('div');
        kanban.className="board"
            const form = document.createElement('form');
            form.id="todo-form"
            form.addEventListener('submit', newTask);
                // Create the task input
                const newTaskInput = document.createElement('input');
                newTaskInput.type = 'text';
                newTaskInput.name = 'userName';
                newTaskInput.className = 'formInput';
                newTaskInput.placeholder = 'New Task...';
                newTaskInput.required = true;
                form.appendChild(newTaskInput)
            kanban.appendChild(form);

            const lanes = document.createElement('div');
            lanes.className="lanes"
                const swimlane = document.createElement('div');
                swimlane.id="tasks-lane";
                    const swimlaneTaskHeading = document.createElement('h3');
                    swimlaneTaskHeading.className="heading"
                    swimlane.appendChild(swimlaneTaskHeading)

                    state.projectTasks.forEach(task => {
                        // returns taskName, description, status, id
                        try {
                            const task = createElement('p');
                            task.dragable=true;
                            task.text=task.taskName;
                            task.id=task.id;
                            task.dataset.description = task.description;
                            swimlane.appendChild(task);
                        } catch (error) {
                            console.error('Error creating lane for task:', task, error);
                        }  
                    });
                lanes.appendChild(swimlane)

                const swimlaneActive = document.createElement('div');
                swimlaneActive.id="tasks-lane";
                    const swimlaneActiveTaskHeading = document.createElement('h3');
                    swimlaneActiveTaskHeading.className="heading"
                    swimlaneActive.appendChild(swimlaneActiveTaskHeading)

                    state.projectActive.forEach(task => {
                        // returns taskName, description, status, id
                        try {
                            const task = createElement('p');
                            task.dragable=true;
                            task.text=task.taskName;
                            task.id=task.id;
                            task.dataset.description = task.description;
                            swimlaneActive.appendChild(task);
                        } catch (error) {
                            console.error('Error creating lane for task:', task, error);
                        }  
                    });
                lanes.appendChild(swimlaneActive)

                const swimlaneComplete = document.createElement('div');
                swimlaneComplete.id="tasks-lane";
                    const swimlaneCompleteTaskHeading = document.createElement('h3');
                    swimlaneCompleteTaskHeading.className="heading"
                    swimlaneComplete.appendChild(swimlaneCompleteTaskHeading)

                    state.projectComplete.forEach(task => {
                        // returns taskName, description, status, id
                        try {
                            const task = createElement('p');
                            task.dragable=true;
                            task.text=task.taskName;
                            task.id=task.id;
                            task.dataset.description = task.description;
                            swimlaneComplete.appendChild(task);
                        } catch (error) {
                            console.error('Error creating lane for task:', task, error);
                        }  
                    });
                lanes.appendChild(swimlaneComplete)
            kanban.appendChild(lanes);
   
        logContent.appendChild(kanban);

    /*
<div class="board">

    <div class="lanes">
        <div class="swim-lane" id="todo-lane">
            <h3 class="heading">Tasks</h3>
            <p class="task" draggable="true">Get groceries</p>
            <p class="task" draggable="true">Feed the dogs</p>
            <p class="task" draggable="true">Mow the lawn</p>
        </div>
        <div class="swim-lane">
            <h3 class="heading">In Progress</h3>
            <p class="task" draggable="true">Binge 80 hours of Game of Thrones</p>
        </div>

        <div class="swim-lane">
            <h3 class="heading">Completed</h3>
            <p class="task" draggable="true">
            Watch video of a man raising a grocery store lobster as a pet
            </p>
        </div>
    </div>
</div>
*/
    

}

async function getTasks(projectId){
    // return taskName, description, status, id
    // map from projectDetails in state
}

function newTask(){
    // returns taskName, description, status, id, projectId, assignedToId
    // status must be task, active, complete
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



