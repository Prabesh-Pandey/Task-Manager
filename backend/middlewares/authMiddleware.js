const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect all authenticated routes
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach full user to request, including department
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};

// Middleware to restrict to admin users only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

// ✅ Optional: Middleware to ensure user only acts within their department
const departmentMatch = (targetDepartment) => (req, res, next) => {
  if (req.user && req.user.department === targetDepartment) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: department mismatch" });
  }
};

module.exports = {
  protect,
  adminOnly,
  departmentMatch, // Optional if needed
};
