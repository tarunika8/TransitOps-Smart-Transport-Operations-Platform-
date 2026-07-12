import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import app from "./app.js";

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

import User from "./models/User.js";

await User.create({
    name: "Test User",
    email: "test@test.com",
    password: "123456",
    role: "Fleet Manager"
});