document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (!userName) {
        alert('You must be logged in to view tasks.');
        window.location.href = '/auth';
        return;
    }

    // Display user's name
    document.getElementById('user-name-display').textContent = `Hello, ${userName}!`;

    // Display post task section for posters
    if (userRole === 'poster') {
        document.getElementById('task-form').style.display = 'block';
        document.getElementById('auth-message').textContent = 'You can post a new task below.';
        document.getElementById('auth-message').style.display = 'block';
    } else {
        document.getElementById('auth-message').textContent = 'Sign up as a poster to post tasks.';
        document.getElementById('auth-message').style.display = 'block';
    }

    // Handle logout
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/auth';
    });

    // Handle task form submission
    document.getElementById('task-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const category = document.getElementById('task-category').value;
        const location = document.getElementById('task-location').value;

        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, category, location, postedBy: userName }),
        });

        if (response.ok) {
            alert('Task posted successfully!');
            fetchTasks();
        } else {
            alert('Failed to post task.');
        }
    });

    // Fetch and display tasks
    const fetchTasks = async () => {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();
            
            const tasksList = document.getElementById('tasks-list');
            const myTasksList = document.getElementById('my-tasks-list');
            
            tasksList.innerHTML = '';
            myTasksList.innerHTML = '';
            
            tasks.forEach(task => {
                const taskCard = document.createElement('div');
                taskCard.className = 'task-card';

                let buttonHtml = '';
                if (userRole === 'helper' && task.status === 'open') {
                    // Correctly add data-task-id for helpers
                    buttonHtml = `<button class="accept-btn" data-task-id="${task._id}">Accept Task</button>`;
                } else if (task.status === 'in-progress' && task.acceptedBy === userName) {
                    // Correctly add data-task-id for posters to mark complete
                    buttonHtml = `<button class="complete-btn" data-task-id="${task._id}">Mark Complete</button>`;
                }

                taskCard.innerHTML = `
                    <h4>${task.title}</h4>
                    <p><strong>Description:</strong> ${task.description}</p>
                    <p><strong>Category:</strong> ${task.category}</p>
                    <p><strong>Location:</strong> ${task.location}</p>
                    <p><strong>Status:</strong> ${task.status}</p>
                    ${buttonHtml}
                `;

                if (task.postedBy === userName) {
                    myTasksList.appendChild(taskCard);
                } else {
                    tasksList.appendChild(taskCard);
                }
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            alert('Error: Internal server error.');
        }
    };

    // Event listener for "Accept Task" and "Complete" buttons
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('accept-btn')) {
            const taskId = e.target.dataset.taskId;
            try {
                const response = await fetch(`/api/tasks/${taskId}/accept`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ helperName: userName })
                });

                if (response.ok) {
                    alert('Task accepted!');
                    fetchTasks(); // Reload tasks to update UI
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error accepting task:', error);
                alert('An error occurred. Please try again.');
            }
        } else if (e.target.classList.contains('complete-btn')) {
            const taskId = e.target.dataset.taskId;
            try {
                const response = await fetch(`/api/tasks/${taskId}/complete`, {
                    method: 'POST',
                });

                if (response.ok) {
                    alert('Task marked as complete!');
                    fetchTasks(); // Reload tasks to update UI
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error marking task as complete:', error);
                alert('An error occurred. Please try again.');
            }
        }
    });

    fetchTasks();
});