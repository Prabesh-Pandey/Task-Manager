const Task = require('../models/Tasks');
const User = require('../models/User');

// @desc Get all tasks (admin can get all, users see only tasks assigned + same department)
// @route GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {
            department: req.user.department // ✅ enforce department filter for all roles
        };

        if (status) {
            filter.status = status;
        }

        // Limit to assignedTo if not admin
        if (req.user.role !== "admin") {
            filter.assignedTo = req.user._id;
        }

        let tasks = await Task.find(filter).populate("assignedTo", "name email profileImageUrl");

        tasks = await Promise.all(tasks.map((task) => {
            const completedCount = task.todoChecklist.filter(item => item.completed).length;
            return { ...task._doc, completedTodoCount: completedCount };
        }));

        // Count summaries with same filter
        const countFilter = { department: req.user.department };
        if (req.user.role !== "admin") {
            countFilter.assignedTo = req.user._id;
        }

        const [allTasks, pendingTasks, inProgressTasks, completedTasks] = await Promise.all([
            Task.countDocuments(countFilter),
            Task.countDocuments({ ...countFilter, status: "Pending" }),
            Task.countDocuments({ ...countFilter, status: "In Progress" }),
            Task.countDocuments({ ...countFilter, status: "Completed" }),
        ]);

        res.json({
            tasks,
            statusSummary: {
                all: allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// @desc Get task by ID
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            'assignedTo',
            'name email profileImageUrl department'
        );

        if (!task) return res.status(404).json({ message: "Task not found" });

        if (
            req.user.role !== "admin" &&
            (!task.assignedTo.some(user => user._id.equals(req.user._id)) || task.department !== req.user.department)
        ) {
            return res.status(403).json({ message: "Not authorized to access this task" });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Create a new task (admin only)
// @route POST /api/tasks
// @access Private(admin)
const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist } = req.body;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
        }

        const department = req.user.department;

        const users = await User.find({ _id: { $in: assignedTo }, department });
        if (users.length !== assignedTo.length) {
            return res.status(400).json({ message: "All assigned users must belong to your department" });
        }

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            attachments,
            todoChecklist,
            department // auto-assign department
        });

        res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update task
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (req.user.role !== "admin" && task.department !== req.user.department) {
            return res.status(403).json({ message: "Not authorized" });
        }

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                return res.status(400).json({ message: "assignedTo must be an array" });
            }

            const users = await User.find({ _id: { $in: req.body.assignedTo }, department: task.department });
            if (users.length !== req.body.assignedTo.length) {
                return res.status(400).json({ message: "Assigned users must be in same department" });
            }

            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        res.json({ message: "Task updated", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Delete task (admin only)
// @route DELETE /api/tasks/:id
// @access Private(admin)
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        await task.deleteOne();
        res.json({ message: "Task deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update task status
// @route PUT /api/tasks/:id/status
// @access Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        await task.save();
        res.json({ message: "Status updated", task });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update checklist
// @route PUT /api/tasks/:id/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });

        const isAssigned = task.assignedTo.some(id => id.equals(req.user._id));

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        task.todoChecklist = todoChecklist;
        const completedCount = todoChecklist.filter(item => item.completed).length;
        const total = todoChecklist.length;
        task.progress = total ? Math.round((completedCount / total) * 100) : 0;
        task.status = task.progress === 100 ? "Completed" : (task.progress > 0 ? "In Progress" : "Pending");

        await task.save();

        const updatedTask = await Task.findById(req.params.id).populate("assignedTo", "name email profileImageUrl");

        res.json({ message: "Checklist updated", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Get dashboard data (admin)
// @route GET /api/tasks/dashboard-data
// @access Private(admin)
const getDashboardData = async (req, res) => {
    try {
        const departmentFilter = { department: req.user.department }; // ✅ apply department filter

        const totalTasks = await Task.countDocuments(departmentFilter);
        const pendingTasks = await Task.countDocuments({ ...departmentFilter, status: "Pending" });
        const completedTasks = await Task.countDocuments({ ...departmentFilter, status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            ...departmentFilter,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() }
        });

        // Task distribution by status
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: departmentFilter }, // ✅ added
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                },
            },
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, '');
            acc[formattedKey] = taskDistributionRaw.find(item => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        // Task distribution by priority
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: departmentFilter }, // ✅ added
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                },
            },
        ]);
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelsRaw.find(item => item._id === priority)?.count || 0;
            return acc;
        }, {});

        // Recent tasks
        const recentTasks = await Task.find(departmentFilter) // ✅ added
            .sort({ createdAt: -1 })
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks
            },
            charts: {
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// @desc Get user dashboard data
// @route GET /api/tasks/user-dashboard-data
// @access Private(user)
const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        const baseFilter = { assignedTo: userId };

        const [totalTasks, pendingTasks, completedTasks, overdueTasks] = await Promise.all([
            Task.countDocuments(baseFilter),
            Task.countDocuments({ ...baseFilter, status: "Pending" }),
            Task.countDocuments({ ...baseFilter, status: "Completed" }),
            Task.countDocuments({ ...baseFilter, status: { $ne: "Completed" }, dueDate: { $lt: new Date() } }),
        ]);

        const statuses = ["Pending", "In Progress", "Completed"];
        const priorities = ["Low", "Medium", "High"];

        const taskDistributionRaw = await Task.aggregate([
            { $match: baseFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const taskDistribution = statuses.reduce((acc, s) => {
            acc[s.replace(/\s+/g, '')] = taskDistributionRaw.find(d => d._id === s)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        const priorityDistRaw = await Task.aggregate([
            { $match: baseFilter },
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);
        const taskPriorityLevels = priorities.reduce((acc, p) => {
            acc[p] = priorityDistRaw.find(d => d._id === p)?.count || 0;
            return acc;
        }, {});

        const recentTasks = await Task.find(baseFilter).sort({ createdAt: -1 }).limit(10).select("title status priority dueDate createdAt");

        res.json({
            statistics: { totalTasks, pendingTasks, completedTasks, overdueTasks },
            charts: { taskDistribution, taskPriorityLevels },
            recentTasks
        });
    } catch (error) {
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
