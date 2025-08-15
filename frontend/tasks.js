document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const tasksList = document.getElementById('tasks-list');
    const authMessage = document.getElementById('auth-message');
    const myTasksList = document.getElementById('my-tasks-list');
    const userNameDisplay = document.getElementById('user-name-display');
    const logoutButton = document.getElementById('logout-button');

    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('userName');

    // Conditionally display the form and user info based on login status
    if (isLoggedIn === 'true') {
        if (taskForm) {
            taskForm.style.display = 'flex';
        }
        if (userNameDisplay) {
            userNameDisplay.textContent = currentUser;
        }
        if (logoutButton) {
            logoutButton.style.display = 'block';
        }
        if (authMessage) {
            authMessage.style.display = 'none';
        }
    } else {
        if (taskForm) {
            taskForm.style.display = 'none';
        }
        if (authMessage) {
            authMessage.style.display = 'block';
            authMessage.innerHTML = 'Please <a href="/auth">log in</a> to post a task.';
        }
    }

    // Function to fetch and display tasks
    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/tasks');
            const tasks = await res.json();
            
            tasksList.innerHTML = '';
            myTasksList.innerHTML = '';

            const myTasks = tasks.filter(task => task.postedBy === currentUser);
            const otherTasks = tasks.filter(task => task.postedBy !== currentUser);
            
            // Display other tasks (available tasks)
            otherTasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = 'task-card';
                taskCard.innerHTML = `
                    <h4>${task.title}</h4>
                    <p><strong>Category:</strong> ${task.category}</p>
                    <p>${task.description}</p>
                    <p><strong>Location:</strong> ${task.location}</p>
                    <p><strong>Posted By:</strong> ${task.postedBy}</p>
                    <p><strong>Status:</strong> ${task.status}</p>
                    ${task.status === 'open' ? `<button class="accept-task-btn nav-button" data-task-id="${task.id}">Accept Task</button>` : ''}
                `;
                tasksList.appendChild(taskCard);
            });

            // Display my tasks
            myTasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = 'task-card';
                taskCard.innerHTML = `
                    <h4>${task.title}</h4>
                    <p><strong>Category:</strong> ${task.category}</p>
                    <p>${task.description}</p>
                    <p><strong>Location:</strong> ${task.location}</p>
                    <p><strong>Posted By:</strong> ${task.postedBy}</p>
                    <p><strong>Status:</strong> ${task.status}</p>
                    ${task.status === 'in-progress' ? `<button class="mark-complete-btn nav-button" data-task-id="${task.id}">Mark as Complete</button>` : ''}
                `;
                myTasksList.appendChild(taskCard);
            });

        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            alert('Failed to load tasks. Please try again.');
        }
    };

    // Handle task form submission
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const category = document.getElementById('task-category').value;
        const location = document.getElementById('task-location').value;

        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                category,
                location,
                postedBy: currentUser
            })
        });

        if (res.status === 201) {
            alert('Task posted successfully!');
            taskForm.reset();
            fetchTasks();
        } else {
            alert('Failed to post task.');
        }
    });

    // Handle task acceptance
    tasksList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('accept-task-btn')) {
            const taskId = e.target.dataset.taskId;
            const res = await fetch(`/api/tasks/${taskId}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ helperName: currentUser })
            });

            const data = await res.json();
            if (res.status === 200) {
                alert(data.message);
                fetchTasks();
            } else {
                alert('Error: ' + data.message);
            }
        }
    });

    // Handle marking a task as complete
    myTasksList.addEventListener('click', async (e) => {
        if (e.target.classList.contains('mark-complete-btn')) {
            const taskId = e.target.dataset.taskId;
            
            const res = await fetch(`/api/tasks/${taskId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            
            const data = await res.json();
            if (res.status === 200) {
                alert(data.message);
                fetchTasks();
            } else {
                alert('Error: ' + data.message);
            }
        }
    });

    // Handle user log out
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = '/';
        });
    }

    // Initial fetch of tasks when the page loads
    fetchTasks();
});
