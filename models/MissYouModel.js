import mongoose from "mongoose";


const MissYouSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  count: { type: Number, default: 0 , expires: '' },
  streak: { type: Number, default: 0 },
    timeline: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: { type: String, enum: ["miss"], default: "miss" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
},
 { timestamps: true }
);

export const MissYou =
  mongoose.models.MissYou || mongoose.model("MissYou", MissYouSchema);
