const Task = require('../models/Tasks');
const { create } = require('../models/User');

// @desc Get all tasks (admin can get all, user can get assigned only)
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
// @desc Get task by ID
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Create a new task (admin only)
// @route POST /api/tasks
// @access Private(admin)
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist
        } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "AssignedTo must be an array of user IDs" });
        }
        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            todoChecklist,
            attachments
        });

        res.status(201).json({
            message: "Task created successfully", task
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update task details
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Delete a task (admin only)
// @route DELETE /api/tasks/:id
// @access Private(admin)
const deleteTask = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update task status
// @route PUT /api/tasks/:id/status 
// @access Private
const updateTaskStatus = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update task checklist
// @route PUT /api/tasks/:id/todo   
// @access Private
const updateTaskChecklist = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Get dashboard data (admin)
// @route GET /api/tasks/dashboard-data
// @access Private(admin)
const getDashboardData = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Get user dashboard data (user)
// @route GET /api/tasks/user-dashboard-data
// @access Private(user)
const getUserDashboardData = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData
};


