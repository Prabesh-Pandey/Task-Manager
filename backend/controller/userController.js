const Task = require('../models/Tasks');
const User = require('../models/User');
const bycrypt = require('bcryptjs');

// @desc Get all users admin only
// @route GET /api/users
// @access Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'member' }).select("-password");

        // Add task count to each user
        const usersWithTaskCount = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({ assignedTo: user._id, status: 'pending' });
            const inProgressTasks = await Task.countDocuments({ assignedTo: user._id, status: 'in progress' });
            const completedTasks = await Task.countDocuments({ assignedTo: user._id, status: 'completed' });

            return {
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completedTasks
            };
        }));
        res.json(usersWithTaskCount);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Get user by ID
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Delete user by ID
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = async (req, res) => {
    try { } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { getUsers, getUserById, deleteUser };