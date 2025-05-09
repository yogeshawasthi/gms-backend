const Membership = require('../Modals/membership.js');

exports.addMembership = async (req, res) => {
    try {
        const { months, price } = req.body;

        console.log("Request Body:", req.body); // Debugging
        console.log("Gym ID from token:", req.gym?._id); // Debugging

        if (!months || !price) {
            console.log("Validation failed: Months or price is missing"); // Debugging
            return res.status(400).json({ error: "Months and price are required" });
        }

        const membership = await Membership.findOne({ months, gym: req.gym._id });
        console.log("Existing Membership:", membership); // Debugging

        if (membership) {
            membership.price = price;
            await membership.save();
            console.log("Membership updated successfully"); // Debugging
            return res.status(200).json({
                message: "Membership Updated Successfully",
            });
        }

        console.log("Creating new membership with data:", { months, price, gym: req.gym._id }); // Debugging
        const newMembership = new Membership({
            months,
            price,
            gym: req.gym._id,
        });
        console.log("New membership instance created:", newMembership); // Debugging

        await newMembership.save();
        console.log("New membership added successfully"); // Debugging
        res.status(200).json({
            message: "Added Successfully",
        });
    } catch (err) {
        console.error("Error in addMembership:", err); // Debugging
        res.status(500).json({ error: "Server Error" });
    }
};
exports.getMembership = async (req, res) => {
    try {
        const loggedInId = req.gym._id;
        const memberships = await Membership.find({ gym: loggedInId });

        res.status(200).json({
            message: "Memberships Fetched Successfully",
            membership: memberships,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Server Error" });
    }
};


exports.expiringWithIn4To7Days = async (req, res) => {
    try{

    }catch(err){
        console.log(err);
        res.status(500).json({ error: "Server Error" });
    

    }

}

exports.ixActiveMember = async (req, res) => {
    try {
         

        const members = await Member.find({
            gym: req.gym._id,
            status:"Pending"
        });

        res.status(200).json({
            message: member.length ? "Fetched members successfully" : "No inactive members found",
            members:member,
            totalMembers: members.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
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

        if (membership) {
            let jngDate = new Date(joiningDate);
            const membershipDetails = await Membership.findById(membership); // Fetch membership details
            if (!membershipDetails) {
                return res.status(400).json({ error: "No such Membership exists" });
            }

            const nextBillDate = addMonthsToDate(membershipDetails.months, jngDate);
            let newMember = new Member({
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
        } else {
            return res.status(400).json({ error: "Membership ID is required" });
        }
    } catch (err) {
        console.error("Error in registerMember:", err);
        res.status(500).json({ error: 'Server Error' });
    }
};
