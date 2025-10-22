import express from "express";
import protect from "../middleware/authMiddleware.js";
import { generateInvite, acceptInvite, getInvite } from "../controllers/InviteController.js";

const router = express.Router();

router.post("/invite", protect, generateInvite);     // generate invite (logged in)
router.post("/invite/accept/:code", protect, acceptInvite); // accept while logged in
router.get("/invite/:code", getInvite);               // optional public info about code

export default router;
