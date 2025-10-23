import User from "../models/UserModel.js";
import  { MissYou } from "../models/MissYouModel.js";
import dayjs from "dayjs";

// POST /api/missyou
// Private
export const handleMissYou = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const username = user.username;

    if (!user.partnerId) {
      return res.status(400).json({ message: "You are not connected to anyone yet." });
    }

    const partnerId = user.partnerId;
    let record = await MissYou.findOne({ sender: userId, receiver: partnerId });
    const today = dayjs().startOf("day");

    if (!record) {
      record = new MissYou({
        sender: userId,
        receiver: partnerId,
        count: 1,
        lastClicked: today,
        streak: 1,
        timeline: [{ userId, type: "miss" }],
      });
    } else {
      const lastClickDay = dayjs(record.lastClicked).startOf("day");

      if (today.isSame(lastClickDay)) {
        record.count += 1;
      } else if (today.diff(lastClickDay, "day") === 1) {
        record.count += 1;
        record.streak += 1;
        record.lastClicked = today;
      } else {
        record.count += 1;
        record.streak = 1;
        record.lastClicked = today;
      }

      // ✅ Always log a new timeline entry
      record.timeline.push({ userId, type: "miss" });
    }

    await record.save();

    // ✅ Emit to partner in real time
    const io = req.app.get("io");
    io.to(partnerId.toString()).emit("missYouUpdate", {
      from: userId,
      count: record.count,
      streak: record.streak,
    });

    res.json({
      from: username,
      message: "Miss You recorded successfully",
      count: record.count,
      streak: record.streak,
      timeline: record.timeline,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMissYouStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get logged-in user
    const user = await User.findById(userId);

    if (!user.partnerId) {
      return res.status(400).json({ message: "You are not connected to anyone yet." });
    }

    const partnerId = user.partnerId;

    // Timeline of misses
    const timelineData = await MissYou.find({
  $or: [
    { sender: userId, receiver: partnerId },
    { sender: partnerId, receiver: userId }
  ]
}).sort({ lastClicked: -1 })
  .select("timeline")
  .lean();



    // Fetch how many times logged-in user clicked for partner
    const userRecord = await MissYou.findOne({ sender: userId, receiver: partnerId });
    const userCount = userRecord ? userRecord.count : 0;
    const userStreak = userRecord ? userRecord.streak : 0;

    // Fetch how many times partner clicked for logged-in user
    const partnerRecord = await MissYou.findOne({ sender: partnerId, receiver: userId });
    const partnerCount = partnerRecord ? partnerRecord.count : 0;
    const partnerStreak = partnerRecord ? partnerRecord.streak : 0;

    // Respond with both stats
    res.json({
      youClicked: { count: userCount, streak: userStreak },
      partnerClicked: { count: partnerCount, streak: partnerStreak },
        partnerId: user.partnerId,
      timeline: timelineData.flatMap(r => r.timeline || []),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
