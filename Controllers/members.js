const Member = require('../models/member'); // Ensure the Member model path is correct

// Controller to get monthly members
exports.monthlyMember = async (req, res) => {
  try {
    const members = await Member.find({ gym: req.gym._id });
    res.status(200).json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to fetch members whose subscription is expiring within 3 days
exports.expiringWithin3Days = async (req, res) => {
  try {
    const today = new Date();
    const nextThreeDays = new Date();
    nextThreeDays.setDate(today.getDate() + 3);

    const members = await Member.find({
      gym: req.gym._id,
      nextBillDate: {
        $gte: today,
        $lte: nextThreeDays
      }
    });

    res.status(200).json({
      message: members.length
        ? "Fetched members successfully"
        : "No member is expiring within 3 days",
      members,
      totalMembers: members.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to fetch members whose subscription is expiring within 4 to 7 days
exports.expiringWithin4To7Days = async (req, res) => {
  try {
    const today = new Date();
    const fourDaysFromNow = new Date();
    const sevenDaysFromNow = new Date();
    fourDaysFromNow.setDate(today.getDate() + 4);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const members = await Member.find({
      gym: req.gym._id,
      nextBillDate: {
        $gte: fourDaysFromNow,
        $lte: sevenDaysFromNow
      }
    });

    res.status(200).json({
      message: members.length
        ? "Fetched members successfully"
        : "No member is expiring within 4 to 7 days",
      members,
      totalMembers: members.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to fetch expired members
exports.expiredMembers = async (req, res) => {
  try {
    const today = new Date();
    const members = await Member.find({
      gym: req.gym._id,
      status: "active",
      nextBillDate: { $lt: today } // Less than today (expired)
    });

    res.status(200).json({
      message: members.length
        ? "Fetched members successfully"
        : "No such member has been expired",
      members,
      totalMembers: members.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};