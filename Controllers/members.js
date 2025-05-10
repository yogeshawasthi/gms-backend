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
  

  function addMonthsToDate(months,joiningDate){
    //get Current year , month and date
    let today = joiningDate;
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    // Calculate the new month and year
    const futureMonth = currentMonth + months;
    const futureYear = currentYear + Math.floor(futureMonth / 12);

    //calculate the correct future month (Modulus for month)
    const adjustedMonth = futureMonth % 12;

    //set the date to the frist of the future month
    const futureDate = new Date(futureYear, adjustedMonth, 1);

    //set the date to the last day of the future month
    const lastDayOfFutureMonth = new Date(futureYear, adjustedMonth + 1, 0).getDate();

    //adjust the day if current day exceeds the last day of the future month
    const adjustedDay = Math.min(currentDay, lastDayOfFutureMonth);

    //set final adjusted date
    futureDate.setDate(adjustedDay);

    return futureDate;

   
  }



 exports.registerMember = async (req, res) => {
    try {
        // Extracting data from the request body
        const { name, mobileNo, address, membership, profilePic, joiningDate } = req.body;
        
        // Finding member by mobile number
        const member = await Member.findOne({ gym: req.gym._id, mobileNo: mobileNo });
        if (member) {
            return res.status(409).json({ error: "Already registered with this Mobile No" });
        }

        // Finding membership details
        const memberShip = await Membership.findOne({ _id: membership, gym: req.gym._id });
        const membershipMonth = memberShip.months;

        if (memberShip) {
            let jngDate = new Date(joiningDate);
            const nextBillDate = addMonthsToDate(membershipMonth, jngDate);
            let newmember = new Member({
                name,
                mobileNo,
                address,
                membership,
                profilePic,
                gym: req.gym._id,
                joiningDate: jngDate,
                nextBillDate: nextBillDate
            });
            // Additional logic regarding membership can be added here, e.g., save the member
        } else {
            return res.status(409).json({ error: "No such Membership are there" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Server error" });
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