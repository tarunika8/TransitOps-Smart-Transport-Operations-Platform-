import express from "express";
import cors from "cors";
import errorHandler from "./middleware/error.middleware.js";

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

export default app;