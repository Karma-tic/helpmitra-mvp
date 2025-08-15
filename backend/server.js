const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// --- Frontend Routes ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/auth.html'));
});

app.get('/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/tasks.html'));
});

// --- API Endpoints ---
app.post('/api/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    const users = JSON.parse(fs.readFileSync('data.json', 'utf8'));

    if (users.find(user => user.email === email)) {
        return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const newUser = { id: users.length + 1, name, email, password, role };
    users.push(newUser);
    fs.writeFileSync('data.json', JSON.stringify(users, null, 2));

    res.status(201).json({ message: 'User created successfully!', user: newUser });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = JSON.parse(fs.readFileSync('data.json', 'utf8'));

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.status(200).json({ message: 'Login successful!', user: user });
});

app.get('/api/tasks', (req, res) => {
    const tasks = JSON.parse(fs.readFileSync('tasks.json', 'utf8'));
    res.status(200).json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const { title, description, category, location, postedBy } = req.body;
    const tasks = JSON.parse(fs.readFileSync('tasks.json', 'utf8'));

    const newTask = {
        id: tasks.length + 1,
        title,
        description,
        category,
        location,
        postedBy: postedBy,
        status: 'open'
    };

    tasks.push(newTask);
    fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));

    res.status(201).json({ message: 'Task posted successfully!', task: newTask });
});

app.post('/api/tasks/:id/accept', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { helperName } = req.body;
    const tasks = JSON.parse(fs.readFileSync('tasks.json', 'utf8'));

    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].acceptedBy = helperName;
        tasks[taskIndex].status = 'in-progress';
        fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
        res.status(200).json({ message: 'Task accepted successfully!' });
    } else {
        res.status(404).json({ message: 'Task not found.' });
    }
});

app.post('/api/tasks/:id/complete', (req, res) => {
    const taskId = parseInt(req.params.id);
    const tasks = JSON.parse(fs.readFileSync('tasks.json', 'utf8'));

    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        tasks[taskIndex].status = 'completed';
        fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2));
        res.status(200).json({ message: 'Task marked as complete!' });
    } else {
        res.status(404).json({ message: 'Task not found.' });
    }
});

// --- Start the server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
