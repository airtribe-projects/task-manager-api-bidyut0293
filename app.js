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
let nextId = 1; // added counter

function loadTasks() {
    try {
        const data = fs.readFileSync(tasksFilePath, 'utf-8');
        const parsed = JSON.parse(data);

        tasks = parsed.tasks || [];

        // ✅ fix ID duplication issue
        nextId = tasks.length > 0
            ? Math.max(...tasks.map(t => t.id)) + 1
            : 1;

    } catch (err) {
        console.error('Error loading tasks:', err.message);

        // ❗ early return (don't overwrite tasks blindly)
        return;
    }
}

// Load tasks on startup
loadTasks();

// Helper function to get next ID
function getNextId() {
    return nextId++; // ✅ safe unique ID
}

// Validation middleware
function validateTaskInput(req, res, next) {
    let { title, description, completed } = req.body;

    // ✅ better validation
    if (!title || typeof title !== 'string') {
        return res.status(400).json({
            error: 'Title is required and must be a string.'
        });
    }

    if (!description || typeof description !== 'string') {
        return res.status(400).json({
            error: 'Description is required and must be a string.'
        });
    }

    // ✅ handle completed properly
    if (completed === undefined) {
        req.body.completed = false;
    } else if (typeof completed !== 'boolean') {
        return res.status(400).json({
            error: 'Completed must be a boolean.'
        });
    }

    next();
}

// POST /tasks - Create a new task
app.post('/tasks', validateTaskInput, (req, res) => {
    const { title, description, completed } = req.body;

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
    try {
        const data = fs.readFileSync(tasksFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        const tasksFromFile = parsed.tasks || [];
        res.status(200).json(tasksFromFile);
    } catch (err) {
        console.error('Error reading tasks:', err.message);
        res.status(500).json({ error: 'Error reading tasks from file.' });
    }
});

// GET /tasks/:id - Get a specific task
app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    if (isNaN(taskId)) {
        return res.status(400).json({ error: 'Invalid task ID.' });
    }

    try {
        const data = fs.readFileSync(tasksFilePath, 'utf-8');
        const parsed = JSON.parse(data);
        const tasksFromFile = parsed.tasks || [];
        const task = tasksFromFile.find(t => t.id === taskId);

        if (!task) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json(task);
    } catch (err) {
        console.error('Error reading tasks:', err.message);
        res.status(500).json({ error: 'Error reading tasks from file.' });
    }
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
    task.completed = completed;

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

    // ✅ ensure deletion happens before response
    const deletedTask = tasks.splice(taskIndex, 1)[0];

    res.status(200).json({
        message: 'Task deleted successfully.',
        task: deletedTask
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message); // ✅ cleaner log
    res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            console.error('Server error:', err);
            return;
        }
        console.log(`Server is listening on ${port}`);
    });
}

module.exports = app;
