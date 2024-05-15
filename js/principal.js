
let tasks = [];
let score = 0;

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('score', score);
}

// Function to load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    const savedScore = localStorage.getItem('score');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTaskList();
    }
    if (savedScore) {
        score = parseInt(savedScore);
        updateScore();
    }
}

// Function to add a new task
function addTask(taskName, priority, timer) {
    const task = {
        id: Date.now(),
        name: taskName,
        priority: priority,
        timer: timer ? timer * 60 : null, // convert minutes to seconds
        timerInterval: null,
        completed: false,
    };
    tasks.push(task);
    renderTaskList();
    saveTasks();
}

// Function to render the task list
function renderTaskList() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach((task) => {
        const taskHTML = `
            <li class="task" data-task-id="${task.id}">
                <span class="task-name">${task.name}</span>
                <span class="task-priority">Priority: ${task.priority}</span>
                <span class="task-timer">${task.timer !== null ? formatTime(task.timer) : ''}</span>
                <div class="task-actions">
                    <button class="edit-task-btn" data-task-id="${task.id}">Edit</button>
                    <button class="delete-task-btn" data-task-id="${task.id}">Delete</button>
                    ${task.timer !== null ? 
                        `<button class="start-timer-btn" data-task-id="${task.id}">Start Timer</button>
                        <button class="pause-timer-btn" data-task-id="${task.id}" style="display: none;">Pause Timer</button>
                        <button class="continue-timer-btn" data-task-id="${task.id}" style="display: none;">Continue Timer</button>` 
                        : ''}
                    <button class="complete-task-btn" data-task-id="${task.id}">Complete</button>
                </div>
            </li>
        `;
        taskList.insertAdjacentHTML('beforeend', taskHTML);
    });
}

// Function to format time in seconds to mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();
    const newTaskInput = document.getElementById('new-task-input');
    const newTaskName = newTaskInput.value.trim();
    const newTaskPriority = document.querySelector('.new-task-priority').value;
    const newTaskTimer = parseInt(document.getElementById('new-task-timer').value);

    if (newTaskName) {
        addTask(newTaskName, newTaskPriority, newTaskTimer);
        newTaskInput.value = '';
        document.getElementById('new-task-timer').value = '';
    }
}

// Function to handle editing a task
function handleEditTask(event) {
    const taskId = event.target.dataset.taskId;
    const taskToEdit = tasks.find((task) => task.id === parseInt(taskId));

    if (taskToEdit) {
        const newTaskName = prompt('Enter the new task name:', taskToEdit.name);
        if (newTaskName) {
            taskToEdit.name = newTaskName;
            renderTaskList();
            saveTasks();
        }
    }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
    const taskId = event.target.dataset.taskId;
    tasks = tasks.filter((task) => task.id !== parseInt(taskId));
    renderTaskList();
    saveTasks();
}

// Function to handle starting the timer for a task
function handleStartTimer(event) {
    const taskId = event.target.dataset.taskId;
    const taskToStartTimer = tasks.find((task) => task.id === parseInt(taskId));

    if (taskToStartTimer) {
        if (taskToStartTimer.timerInterval) return;
        taskToStartTimer.timerInterval = setInterval(() => {
            taskToStartTimer.timer--;
            renderTaskList();
            saveTasks();
            if (taskToStartTimer.timer <= 0) {
                clearInterval(taskToStartTimer.timerInterval);
                taskToStartTimer.timerInterval = null;
                handleTaskFail(taskId);
            }
        }, 1000);

        event.target.style.display = 'none';
        event.target.nextElementSibling.style.display = 'block';
    }
}

// Function to handle pausing the timer for a task
function handlePauseTimer(event) {
    const taskId = event.target.dataset.taskId;
    const taskToPauseTimer = tasks.find((task) => task.id === parseInt(taskId));

    if (taskToPauseTimer && taskToPauseTimer.timerInterval) {
        clearInterval(taskToPauseTimer.timerInterval);
        taskToPauseTimer.timerInterval = null;

        event.target.style.display = 'none';
        event.target.nextElementSibling.style.display = 'block';
        saveTasks();
    }
}

// Function to handle continuing the timer for a task
function handleContinueTimer(event) {
    handleStartTimer(event);
    event.target.style.display = 'none';
    event.target.previousElementSibling.style.display = 'block';
}

// Function to handle completing a task
function handleCompleteTask(event) {
    const taskId = event.target.dataset.taskId;
    const taskToComplete = tasks.find((task) => task.id === parseInt(taskId));

    if (taskToComplete) {
        updateScore(taskToComplete.priority);
        tasks = tasks.filter((task) => task.id !== parseInt(taskId));
        renderTaskList();
        saveTasks();
    }
}

// Function to handle task failure
function handleTaskFail(taskId) {
    const taskToFail = tasks.find((task) => task.id === parseInt(taskId));
    if (taskToFail) {
        updateScore(taskToFail.priority, false);
        tasks = tasks.filter((task) => task.id !== parseInt(taskId));
        renderTaskList();
        saveTasks();
    }
}

// Function to update the score
function updateScore(priority, completed = true) {
    const points = { low: 1, medium: 3, high: 5 };
    if (completed) {
        score += points[priority];
    } else {
        score -= points[priority];
    }
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Event listeners
document.getElementById('new-task-form').addEventListener('submit', handleAddTask);
document.addEventListener('click', (event) => {
    if (event.target.matches('.edit-task-btn')) {
        handleEditTask(event);
    } else if (event.target.matches('.delete-task-btn')) {
        handleDeleteTask(event);
    } else if (event.target.matches('.start-timer-btn')) {
        handleStartTimer(event);
    } else if (event.target.matches('.pause-timer-btn')) {
        handlePauseTimer(event);
    } else if (event.target.matches('.continue-timer-btn')) {
        handleContinueTimer(event);
    } else if (event.target.matches('.complete-task-btn')) {
        handleCompleteTask(event);
    }
});

// Initialize the task list with some sample tasks and load tasks from localStorage
loadTasks();