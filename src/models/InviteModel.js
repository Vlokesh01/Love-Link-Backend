import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },    // short join code
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // set when accepted
  used: { type: Boolean, default: false },                 // one-time or reusable
  expiresAt: { type: Date, default: null },                // optional expiry
  createdAt: { type: Date, default: Date.now },
  meta: { type: Object, default: {} }                      // optional (message, name)
});

export default mongoose.model("Invite", inviteSchema);
