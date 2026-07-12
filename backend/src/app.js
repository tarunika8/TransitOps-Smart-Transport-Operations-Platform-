/*import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

app.get("/", (req, res) => {
    res.send("TransitOps Backend Running");
});

app.get("/test-error", (req, res) => {
    throw new Error("Testing Error Middleware");
});

export default app;*/

import express from "express";
import cors from "cors";
import errorHandler from "./middleware/errorMiddleware.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes will go here
// app.use("/api/auth", authRoutes);
// app.use("/api/drivers", driverRoutes);
// ...

// Test Route
app.get("/", (req, res) => {
  res.send("TransitOps Backend Running");
});

// Test Error Route
app.get("/test-error", (req, res, next) => {
  next(new Error("Testing Error Middleware"));
});

// Error Handler (keep this LAST)
app.use(errorHandler);

export default app;