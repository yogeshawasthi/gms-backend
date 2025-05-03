const Gym = require('../Modals/gym.js');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    try {
        const { userName, password, gymName, profilePic, email } = req.body;

        const isExist = await Gym.findOne({ userName });
        if (isExist) {
            return res.status(400).json({ error: "User Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newGym = new Gym({
            userName,
            password: hashedPassword,
            gymName,
            profilePic,
            email
        });

        await newGym.save();

        res.status(201).json({
            message: "User Registered Successfully",
            success: "yes",
            data: newGym
        });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        const gym = await Gym.findOne({ userName });
        if (!gym) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, gym.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }

        res.json({
            message: "Login Successful",
            success: "true",
            gym
        });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
};