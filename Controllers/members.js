const mongoose = require('mongoose');
const Member = require('../Modals/member'); 
const Membership = require('../Modals/membership'); 



  // Controller to get all members
  
  exports.getAllmember = async (req, res) => {
    try {
      const { skip = 0, limit = 9 } = req.query; 
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
  

  function addMonthsToDate(months, joiningDate) {
    // Ensure joiningDate is a valid date
    const today = new Date(joiningDate);
    if (isNaN(today.valueOf())) {
        throw new Error("Invalid joining date provided");
    }

    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Calculate the new month and year
    const futureMonth = currentMonth + months;
    const futureYear = currentYear + Math.floor(futureMonth / 12);

    // Calculate the correct future month (modulus for month)
    const adjustedMonth = futureMonth % 12;

    // Set the date to the first of the future month
    const futureDate = new Date(futureYear, adjustedMonth, 1);

    // Set the date to the last day of the future month
    const lastDayOfFutureMonth = new Date(futureYear, adjustedMonth + 1, 0).getDate();

    // Adjust the day if the current day exceeds the last day of the future month
    const adjustedDay = Math.min(currentDay, lastDayOfFutureMonth);

    // Set the final adjusted date
    futureDate.setDate(adjustedDay);

    return futureDate;
  }



 exports.registerMember = async (req, res) => {
    try {
        const { name, mobileNo, address, membership, profilePic, joiningDate } = req.body;

        // Check if the member is already registered with the same mobile number
        const member = await Member.findOne({ gym: req.gym._id, mobileNo: mobileNo });
        if (member) {
            return res.status(409).json({ error: "Already registered with this Mobile No" });
        }

        // Find membership details
        const memberShip = await Membership.findOne({ _id: membership, gym: req.gym._id });
        if (!memberShip) {
            return res.status(409).json({ error: "No such Membership exists" });
        }

        const membershipMonth = memberShip.months;
        console.log("Membership Month:", membershipMonth);
        // Check if the membership month is valid

        // Calculate the next billing date
        const jngDate = new Date(joiningDate);
        const nextBillDate = addMonthsToDate(membershipMonth, jngDate);


        // Create a new member
        const newMember = new Member({
            name,
            mobileNo,
            address,
            membership,
            profilePic,
            gym: req.gym._id,
            nextBillDate,
        });

        await newMember.save();
        return res.status(200).json({ message: "Member registered successfully", newMember });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
    }
};


// Controller to get monthly members
exports.monthlyMember = async (req, res) => {
  try {
    const now = new Date();
    // Get the first day fo the current month
    const starOfMonth = new Date(now.getFullYear(),now.getMonth(),1)

    // Get the last day of the current month
    const endOfMonth = new Date(now.getFullYear(),now.getMonth() + 1,0,23,59,59,999);

    const member = await Member.find({ gym: req.gym._id ,
      createdAt:{
        $gte: starOfMonth,//
        $lte: endOfMonth
      }
    }).sort({ createdAt: -1 });
    
    res.status(200).json({ 
      message: member.length
        ? "Fetched members successfully"
        : "No member registered in this month",
      members: member,
    totalMembers: member.length});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Controller to fetch members whose subscription is expiring within 3 days
exports.expiringWithin3Days = async (req, res) => {
  try {
    const today = new Date();
    console.log(today);
    const nextThreeDays = new Date();
    nextThreeDays.setDate(today.getDate() + 3);

    const members = await Member.find({
      gym: req.gym._id,
      nextBillDate: {
        $gte: today, //Greater than or equal to today
        $lte: nextThreeDays // Less than or equal to 3 days from now
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
    const next4Days = new Date();
     sevenDaysFromNow = new Date();

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

exports.searchMeber = async (req, res) => { 
  try {
    const { searchTerm } = req.query;
    console.log("Search Query:", searchTerm);

    const member = await Member.find({
      gym: req.gym._id,
      $or: [
        { name: { $regex: '^' + searchTerm, $options: "i" } },
        { mobileNo: { $regex: '^' + searchTerm, $options: "i" } }
      ]
    });

    res.status(200).json({
      message: member.length
        ? "Fetched members successfully"
        : "No such member found",
      membes: member,
      totalMembers: member.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }

}