import User from "../models/UserModel.js";

export const connectUsers = async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;

    if (!userId1 || !userId2) {
      return res.status(400).json({ message: "Both user IDs are required" });
    }

    // Find both users
    const user1 = await User.findById(userId1);
    const user2 = await User.findById(userId2);

    if (!user1 || !user2) {
      return res.status(404).json({ message: "User not found" });
    }

    // Link them
    user1.partnerId = userId2;
    user2.partnerId = userId1;

    await user1.save();
    await user2.save();

    res.json({ message: "Users connected successfully", user1, user2 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserWithPartner = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch user and populate partner details
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let partner = null;
    if (user.partnerId) {
      partner = await User.findById(user.partnerId).lean();
    }

    res.status(200).json({
      message: "User and partner details fetched successfully",
      user: user,
      partner: partner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};