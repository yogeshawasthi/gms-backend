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

exports.deleteMembership = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Membership.findOneAndDelete({ _id: id, gym: req.gym._id });
        if (!deleted) {
            return res.status(404).json({ error: "No such membership found" });
        }
        res.status(200).json({ message: "Membership deleted successfully" });
    } catch (err) {
        console.error("Error in deleteMembership:", err);
        res.status(500).json({ error: "Server Error" });
    }
};

