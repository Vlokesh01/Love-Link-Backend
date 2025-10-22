import Invite from "../models/InviteModel.js";
import User from "../models/UserModel.js";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 7); // 7 chars

// POST /api/users/invite
// body: { expiresInDays: 7, oneTime: true, message: "Hi, connect with me" }
export const generateInvite = async (req, res) => {
  try {
    const { expiresInDays = null, oneTime = true, message } = req.body;
    const creatorId = req.user._id;

    // create code (ensure uniqueness with retry)
    let code;
    for (let i = 0; i < 5; i++) {
      code = nanoid();
      const exists = await Invite.findOne({ code });
      if (!exists) break;
      code = null;
    }
    if (!code) return res.status(500).json({ message: "Could not generate invite code" });

    const invite = await Invite.create({
      code,
      creator: creatorId,
      used: false,
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null,
      meta: { message }
    });

    // Build shareable link (frontend domain)
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:3000";
    const link = `${frontendBase}/connect/${code}`;

    res.status(201).json({ code, link, invite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users/invite/accept/:code
// Must be logged in (protect). Accepts the invite and connects users (creator <-> accepter)
export const acceptInvite = async (req, res) => {
  try {
    const code = req.params.code;
    const accepterId = req.user._id;

    const invite = await Invite.findOne({ code }).populate("creator");
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invite has expired" });
    }
    if (invite.used) {
      return res.status(400).json({ message: "Invite already used" });
    }

    const creator = await User.findById(invite.creator._id);
    const accepter = await User.findById(accepterId);

    if (!creator || !accepter) return res.status(404).json({ message: "User not found" });

    // Simple check: don't allow self-accept
    if (String(creator._id) === String(accepter._id)) {
      return res.status(400).json({ message: "Cannot accept your own invite" });
    }

    // Check if either already connected
    if (creator.partnerId || accepter.partnerId) {
      return res.status(400).json({ message: "Either creator or you already have a partner" });
    }

    // Link both users
    creator.partnerId = accepter._id;
    accepter.partnerId = creator._id;
    await creator.save();
    await accepter.save();

    // mark invite used and save partner
    invite.used = true;
    invite.partner = accepter._id;
    await invite.save();

    return res.json({ message: "Connected successfully", creator, accepter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// optional: GET /api/users/invite/:code — show invite preview publicly (do not reveal sensitive info)
export const getInvite = async (req, res) => {
  try {
    const code = req.params.code;
    const invite = await Invite.findOne({ code }).populate("creator", "username");
    if (!invite) return res.status(404).json({ message: "Invite not found" });

    res.json({
      code: invite.code,
      creator: invite.creator ? { id: invite.creator._id, username: invite.creator.username } : null,
      message: invite.meta?.message || null,
      expiresAt: invite.expiresAt,
      used: invite.used
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
