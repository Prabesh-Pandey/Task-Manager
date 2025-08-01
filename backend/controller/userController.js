const Task = require('../models/Tasks');
const User = require('../models/User');

// @desc Get all users in the same department (admin only)
// @route GET /api/users
// @access Private/Admin
const getUsers = async (req, res) => {
    try {
        const department = req.user.department;

        // Get only members from same department
        const users = await User.find({
            role: 'member',
            department: department,
        }).select('-password');

        // Add task count per user
        const usersWithTaskCount = await Promise.all(
            users.map(async (user) => {
                const pendingTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: 'Pending',
                    department: department,
                });

                const inProgressTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: 'In Progress',
                    department: department,
                });

                const completedTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: 'Completed',
                    department: department,
                });

                return {
                    ...user._doc,
                    pendingTasks,
                    inProgressTasks,
                    completedTasks,
                };
            })
        );

        res.json(usersWithTaskCount);
    } catch (error) {
        res
            .status(500)
            .json({ message: 'Server error', error: error.message });
    }
};

// @desc Get user by ID (same department check can be added if needed)
// @route GET /api/users/:id
// @access Private
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: restrict access by department
        if (
            req.user.role !== 'admin' &&
            user._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(user);
    } catch (error) {
        res
            .status(500)
            .json({ message: 'Server error', error: error.message });
    }
};

// @desc Delete user by ID (admin)
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // ✅ Prevent deletion across departments
        if (user.department !== req.user.department) {
            return res
                .status(403)
                .json({ message: 'Cannot delete user from another department' });
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res
            .status(500)
            .json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    deleteUser,
};
