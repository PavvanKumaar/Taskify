import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { config } from "./config";
import app from "./app";
import { connectDB } from "./config/database";
import { setupSockets } from './sockets/index';

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});

setupSockets(io);
app.set("io", io);

connectDB().then(async () => {
  // Ensure a default workspace always exists
  const { WorkspaceModel } = await import("./models/workspace.model");
  const existing = await WorkspaceModel.findOne();
  if (!existing) {
    await WorkspaceModel.create({ name: "My Workspace", imageUrl: "" });
    console.log("Default workspace created");
  }

  server.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
  });
});
