import express from "express";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import authRoutes from "./routers/authRoute.js";
import userDetailsRoutes from "./routers/userDetails.js";
import missYouRoutes from "./routers/missYouRoute.js";
import inviteRoutes from "./routers/inviteRoute.js";
import cors from "cors";
import { Server } from "socket.io";
import http from "http"; // Needed for socket.io
import {  MissYou }  from "./models/MissYouModel.js"; // import model

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});

// Attach io to app for controllers
app.set("io", io);

// Socket.IO connection
io.on("connection", (socket) => {

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// API routes
app.use("/api/users", authRoutes);
app.use("/api/users/details", userDetailsRoutes);
app.use("/api/users/missyou", missYouRoutes);
app.use("/api/users", inviteRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start the server using HTTP server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
