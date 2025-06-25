const { text } = require("express");
const mongoose = require("mongoose");


const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },

});

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String }, // Reference to User model
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
        status: { type: String, enum: ["Pending", "In progress", "Completed"], default: "Pending" },
        dueDate: { type: Date, required: true },
        assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Reference to User model
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to User model
        attachments: [{ type: String }], // Array of attachment URLs
        todoChecklist: [todoSchema],
        progress: { type: Number, default: 0 } // Progress percentage
    },
    {
        timestamps: true
    });

module.exports = mongoose.model("Task", taskSchema);