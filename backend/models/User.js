const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        profileImageUrl: { type: String, default: "null" },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member",
        }, // role-based access
        department: {
            type: String,
            enum: ["Sales", "Advertising", "Marketing"],
            default: null,
        }, //  new field
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
