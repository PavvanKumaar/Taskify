import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth";
import memberRoutes from "./routes/members";
import taskRoutes from "./routes/tasks";
import projectRoutes from "./routes/project";
import workspaceRoutes from "./routes/workspace";
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

app.use(cors({
  origin: 'https://taskify-djmp.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Server is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/workspaces", workspaceRoutes);

app.use(errorHandler);

export default app;
