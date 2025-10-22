import { MissYou } from "./models/MissYouModel.js";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/authRoute.js";
import missYouRoutes from "./routes/missYouRoute.js";
import inviteRoutes from "./routes/inviteRoute.js";
import getUserWithPartner from "./routes/userDetails.js";


dotenv.config();
connectDB();

const app = express();
app.use(cors({
  origin: "http://localhost:3000", // <-- your frontend URL
  credentials: true,
}));
app.use(express.json());
// test api
app.get("/", (req, res) => {
  res.send("💖 LoveLink Backend is running 💖");
});
// Routes
app.use("/api/users", userRoutes);
app.use("/api/missyou", missYouRoutes);
app.use("/api/users/", inviteRoutes);
app.use("/api/users/details", getUserWithPartner);

// Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.io connection handling
io.on("connection", (socket) => {

  // Join a room for the user
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
  });

  // When someone clicks the MissYou button
  socket.on("missYouClicked", async ({ senderId, receiverId }) => {
    // Update DB (you can use your existing MissYou logic)
    const record = await MissYou.findOneAndUpdate(
      { sender: senderId, receiver: receiverId },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    // Emit updated stats to both users
    io.to(senderId).emit("updateStats", record);
    io.to(receiverId).emit("updateStats", record);
  });

  socket.on("disconnect", () => {
  });
});
// expose io globally (so controllers can emit)
app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));

