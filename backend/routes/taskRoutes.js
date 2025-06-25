const express = require('express');
const { get } = require('mongoose');
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist } = require('../controller/taskController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const router = express.Router();

//Task management routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks);//get all tasks admin can all and user can get assigned only
router.get("/:id", protect, getTaskById);//get task by id
router.post("/", protect, adminOnly, createTask);//create task
router.put("/:id", protect, updateTask);//update task
router.delete("/:id", protect, adminOnly, deleteTask);//delete task
router.put("/:id/status", protect, updateTaskStatus);//update task status
router.put("/:id/todo", protect, updateTaskChecklist);//update task checklist

module.exports = router;