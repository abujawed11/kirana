import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ Logging middleware (status codes, response time, etc.)
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);

export default app;
