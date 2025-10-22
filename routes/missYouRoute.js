import express from "express";
import protect from "../middleware/authMiddleware.js";
import { handleMissYou , getMissYouStats } from "../controllers/MYController.js";

const router = express.Router();
router.get("/stats", protect, getMissYouStats);
router.post("/click", protect, handleMissYou);

export default router;
