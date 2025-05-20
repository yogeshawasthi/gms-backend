const Gym = require('../Modals/gym.js');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');


exports.register = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // Debugging
        const { userName, password, gymName, profilePic, email } = req.body;

        if (!userName || !password || !gymName || !email) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const isExist = await Gym.findOne({ userName });
        if (isExist) {
            return res.status(400).json({ error: "User Already Exists" });
        }
        

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password:", hashedPassword); // Debugging
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
        res.status(500).json({ error: "Server Error in register", errorMsg: err.message });
    }
}

const cookieOptions = {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: 'Lax',
    // Adjust as needed

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

        
        if (gym && await bcrypt.compare(password, gym.password)) {
            const token = jwt.sign(
                {
                    gym_id: gym._id,
                    email: gym.email,
                    userName: gym.userName,
                    profilePic: gym.profilePic,
                    gymName: gym.gymName
                },
                process.env.JWT_SECRET_KEY
            );

            // Set the token in a cookie
            res.cookie("cookie_token", token, cookieOptions);

            res.json({ message: "Login Successful", success: "true", gym ,token});
        } else {
            res.status(400).json({ error: "Invalid Credentials" });
        }

    } catch (err) {
        console.error("Error in login:", err); // Log error for debugging
        res.status(500).json({ error: "Server Error in login", errorMsg: err.message });
    }
};


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

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
        gym.resetPasswordToken = token;
        gym.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration

        await gym.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL, // Use environment variable for sender email
            to: email,
            subject: 'Password Reset',
            text: `You requested a Password Reset. Your OTP is: ${token}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error in sendMail:", error); // Log error for debugging
                return res.status(500).json({ error: "Failed to send OTP", errorMsg: error.message });
            } else {
                console.log("Email sent:", info.response); // Log success for debugging
                return res.status(200).json({ message: "OTP sent to your email" });
            }
        });
    } catch (err) {
        console.error("Error in sendOtp:", err); // Log error for debugging
        res.status(500).json({ error: "Server Error in sendOtp", errorMsg: err.message });
    }
};

exports.checkOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find the gym by email and OTP
        const gym = await Gym.findOne({
            email,
            resetPasswordToken: otp,
            resetPasswordExpires: { $gt: Date.now() } // Check if the OTP is still valid
        });

        if (!gym) {
            return res.status(400).json({ error: "OTP is invalid or has expired" });
        }

        // OTP is valid, send a success response
        return res.status(200).json({ message: "OTP verified successfully" });

    } catch (err) {
        console.error("Error in checkOtp:", err); // Log error for debugging
        return res.status(500).json({ error: "Server Error in checkOtp", errorMsg: err.message });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const gym = await Gym.findOne({ email });

        if (!gym) {
            return res.status(400).json({ error: 'Some technical Error' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        gym.password = hashedPassword;
        gym.resetPasswordToken = undefined;
        gym.resetPasswordExpires = undefined;

        await gym.save();
        res.status(200).json({ message: "password Reset Sucessfully" })

    } catch (err) {
        res.status(500).json({
            error: "Server Error"
        })
    }
};


exports.logout = async (req, res) => {
    try {
        res.clearCookie("cookie_token", cookieOptions);
        res.status(200).json({ message: "Logout Successful" });
    } catch (err) {
        console.error("Error in logout:", err); // Log error for debugging
        res.status(500).json({ error: "Server Error in logout", errorMsg: err.message });
    }
};