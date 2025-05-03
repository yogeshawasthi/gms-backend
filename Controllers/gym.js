const Gym = require('../Modals/gym.js');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");

exports.register = async (req, res) => {
    try {
        const { userName, password, gymName, profilePic, email } = req.body;

        if (!userName || !password || !gymName || !email) {
            return res.status(400).json({ error: "All fields are required" });
        }

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
        console.error("Error in register:", err); // Log error for debugging
        res.status(500).json({ error: "Server Error in register" });
    }
};

exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        // Validate request body
        if (!userName || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

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
        console.error("Error in login:", err); // Log error for debugging
        res.status(500).json({ error: "Server Error in login" });
    }
};

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate request body
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const gym = await Gym.findOne({ email });
        if (!gym) {
            return res.status(400).json({ error: "Gym Not Found" });
        }

        // Generate OTP
        const buffer = crypto.randomBytes(4); // 4 bytes = 32 bits = 2^32 = 4,294,967,296 possible values
        const token = buffer.readUInt32BE(0) % 900000 + 100000; // 6 digit OTP
        console.log("Generated OTP:", token);

        // TODO: Send OTP via email or SMS (integration required)

        res.status(200).json({
            message: "OTP sent successfully",
            success: "true",
            otp: token // For now, returning OTP in response (remove in production)
        });
    } catch (err) {
        console.error("Error in sendOtp:", err); // Log error for debugging
        res.status(500).json({ error: "Server Error in sendOtp" });
    }
};