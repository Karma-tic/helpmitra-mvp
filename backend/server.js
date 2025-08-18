const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// -------------------- MongoDB Connection --------------------
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Could not connect to MongoDB Atlas...', err));

// -------------------- MongoDB Schemas --------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: String,
});
const User = mongoose.model('User', userSchema);

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  location: String,
  postedBy: String,
  status: { type: String, default: 'open' },
  acceptedBy: String,
});
const Task = mongoose.model('Task', taskSchema);

// -------------------- Frontend Routes --------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/auth.html'));
});

app.get('/tasks', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/tasks.html'));
});

// -------------------- API Endpoints --------------------
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully!' });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    res.status(500).json({ message: 'Failed to create user.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    // Destructure properties to handle potential null user
    const { name, role } = user;
    res.status(200).json({ message: 'Login successful!', user: { name, role } });
  } catch (err) {
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks.' });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, category, location, postedBy } = req.body;
  try {
    const newTask = new Task({ title, description, category, location, postedBy, status: 'open' });
    await newTask.save();
    res.status(201).json({ message: 'Task posted successfully!', task: newTask });
  } catch (err) {
    res.status(500).json({ message: 'Failed to post task.' });
  }
});

app.post('/api/tasks/:id/accept', async (req, res) => {
    const taskId = req.params.id;
    const { helperName } = req.body;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        task.acceptedBy = helperName;
        task.status = 'in-progress';
        await task.save();
        res.status(200).json({ message: 'Task accepted successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post('/api/tasks/:id/complete', async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        task.status = 'completed';
        await task.save();
        res.status(200).json({ message: 'Task marked as complete!' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
