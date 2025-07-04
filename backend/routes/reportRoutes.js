const express = require("express");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { exportTasksReport, exportUsersReport } = require("../controller/reportController");

const router = express.Router();

router.get("/export/tasks", protect, adminOnly, exportTasksReport);//export all tasks as excel/pdf
router.get("/export/users", protect, adminOnly, exportUsersReport);//export u ser task as excel/pdf

module.exports = router;
