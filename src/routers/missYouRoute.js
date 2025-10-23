import express from "express";
import protect from "../middleware/authMiddleware.js";
import { handleMissYou , getMissYouStats } from "../controllers/MYController.js";

const router = express.Router();
router.get("/test", (req, res) => {
  res.json({ message: "MissYou route working" });
});

router.get("/stats", protect, getMissYouStats);
router.post("/click", protect, handleMissYou);

export default router;
