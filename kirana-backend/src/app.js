import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);

// 404
app.use((_req, res) => res.status(404).json({ success: false, error: "Not found" }));

// error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Server error" });
});

export default app;
