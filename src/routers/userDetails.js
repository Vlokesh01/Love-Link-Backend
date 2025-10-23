import { getUserWithPartner } from "../controllers/ConnectController.js";
import express from "express";

const router = express.Router();
// ✅ GET /api/user/details/:userId
router.get("/:userId", getUserWithPartner);

export default router;