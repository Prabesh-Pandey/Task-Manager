const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getUsers, getUserById, deleteUser } = require('../controller/userController');

const router = express.Router();

// user management routes
router.get("/",protect, adminOnly, getUsers);//ger all users admin only
router.get("/:id", protect, getUserById); // get user by id
router.delete("/:id", protect, adminOnly, deleteUser); // delete user by id

module.exports = router;