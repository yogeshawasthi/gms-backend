const mongoose = require('mongoose');
const Member = require('../Modals/member'); 
const Membership = require('../Modals/membership'); 



  // Controller to get all members
  
  exports.getAllmember = async (req, res) => {
    try {
      const { skip = 0, limit = 10 } = req.query; 
      console.log("Skip:", skip, "Limit:", limit); 
  
      const members = await Member.find({ gym: req.gym._id });
      const totalMembers = members.length;
  
      const limitedMembers = await Member.find({ gym: req.gym._id })
        .sort({ createdAt: -1 })
        .skip(parseInt(skip)) 
        .limit(parseInt(limit)); 
  
      res.status(200).json({
        message: members.length
          ? "Fetched Members Successfully"
          : "No any Member Registered yet",
        members: limitedMembers,
        totalMembers: totalMembers,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Server Error" });
    }
  };
  

  // Utility function to add months to a date
  const addMonthsToDate = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };

  exports.registerMember = async (req, res) => {
    try {
        const { name, mobileNo, address, membership, profilePic, joiningDate } = req.body;

        console.log("Request Body:", req.body); // Debugging

        // Check if the member is already registered with the same mobile number
        const member = await Member.findOne({ gym: req.gym._id, mobileNo });
        if (member) {
            return res.status(400).json({ error: 'Already registered with this Mobile No' });
        }

        // Validate membership ID
        if (!mongoose.isValidObjectId(membership)) {
            return res.status(400).json({ error: "Invalid Membership ID" });
        }

        // Fetch membership details from the database
        const membershipDetails = await Membership.findById(membership);
        if (!membershipDetails) {
            return res.status(400).json({ error: "No such Membership exists" });
        }

        // Validate joiningDate
        if (!joiningDate || isNaN(new Date(joiningDate).valueOf())) {
            return res.status(400).json({ error: "Invalid Joining Date" });
        }

        // Calculate the next billing date
        const jngDate = new Date(joiningDate);
        const nextBillDate = addMonthsToDate(jngDate, membershipDetails.months);

        // Validate nextBillDate
        if (isNaN(nextBillDate.valueOf())) {
            return res.status(400).json({ error: "Failed to calculate next billing date" });
        }

        // Create a new member
        const newMember = new Member({
            name,
            mobileNo,
            address,
            membership,
            gym: req.gym._id,
            profilePic,
            nextBillDate
        });

        await newMember.save();
        res.status(200).json({ message: "Member Registered successfully", newMember });
    } catch (err) {
        console.error("Error in registerMember:", err);
        res.status(500).json({ error: 'Server Error' });
    }
  };




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