// routes/userRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import { connectUsers } from "../controllers/ConnectController.js";

const router = express.Router();

// ✅ POST /api/users/register
router.post("/register", registerUser);

// ✅ POST /api/users/login
router.post("/login", loginUser);

// - POST /api/users/connect
router.post("/connect", connectUsers);


export default router;
