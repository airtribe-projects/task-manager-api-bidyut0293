const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load tasks from task.json into memory
const tasksFilePath = path.join(__dirname, 'task.json');
let tasks = [];

function loadTasks() {
    try {
        const data = fs.readFileSync(tasksFilePath, 'utf-8');
        tasks = JSON.parse(data).tasks;
    } catch (err) {
        console.error('Error loading tasks:', err);
        tasks = [];
    }
}

// Load tasks on startup
loadTasks();

// Helper function to find the next available ID
function getNextId() {
    if (tasks.length === 0) return 1;
    return Math.max(...tasks.map(t => t.id)) + 1;
}

// Validation middleware
function validateTaskInput(req, res, next) {
    const { title, description, completed } = req.body;

    // Check if title and description are provided and are strings
    if (!title || typeof title !== 'string' || !description || typeof description !== 'string') {
        return res.status(400).json({
            error: 'Invalid input. Title and description are required and must be strings.'
        });
    }

    // For PUT requests, validate completed field if provided
    if (req.method === 'PUT' && completed !== undefined) {
        if (typeof completed !== 'boolean') {
            return res.status(400).json({
                error: 'Invalid input. Completed must be a boolean.'
            });
        }
    }

    next();
}

// POST /tasks - Create a new task
app.post('/tasks', validateTaskInput, (req, res) => {
    const { title, description, completed = false } = req.body;

    const newTask = {
        id: getNextId(),
        title,
        description,
        completed
    };

    tasks.push(newTask);

    res.status(201).json(newTask);
});

// GET /tasks - Get all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json(tasks);
});

// GET /tasks/:id - Get a specific task
app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID.' });
    }

    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(200).json(task);
});

// PUT /tasks/:id - Update a task
app.put('/tasks/:id', validateTaskInput, (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID.' });
    }

    const task = tasks.find(t => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    const { title, description, completed } = req.body;

    task.title = title;
    task.description = description;
    if (completed !== undefined) {
        task.completed = completed;
    }

    res.status(200).json(task);
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID.' });
    }

    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found.' });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.status(200).json({ message: 'Task deleted successfully.', task: deletedTask });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}

module.exports = app;