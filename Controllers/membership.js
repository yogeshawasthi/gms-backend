const Membership = require('../Modals/membership.js');

exports.addMembership = async (req, res) => {
    try {
        const { months, price } = req.body;

        const membership = await Membership.findOne({ months, gym: req.gym._id });
        if (membership) {
            membership.price = price;
            await membership.save();
            return res.status(200).json({
                message: "Membership Updated Successfully",
            });
        }

        const newMembership = new Membership({
            months,
            price,
            gym: req.gym._id,
        });

        await newMembership.save();
        res.status(200).json({
            message: "Added Successfully",
        });
    } catch (err) {
        console.log(err);
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