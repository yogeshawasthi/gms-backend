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
         // Check if email already exists
        const emailExist = await Gym.findOne({ email: email.toLowerCase() });
        if (emailExist) {
            return res.status(400).json({ error: "Email Already Registered" });
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

        // Generate OTP as a 6-digit string
        const otpNum = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit number
        const token = otpNum.toString(); // Convert OTP to string
        gym.resetPasswordToken = token;
        gym.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiration

        await gym.save();

        const mailOptions = {
            from: `"Gym Management System" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Password Reset OTP',
            text: `You requested a password reset for your Gym Management System account.\n\nYour OTP is: ${token}\n\nIf you did not request this, please ignore this email.`,
            html: `<p>You requested a password reset for your <b>Gym Management System</b> account.</p>
                   <p><b>Your OTP is: <span style="font-size:18px;">${token}</span></b></p>
                   <p>If you did not request this, please ignore this email.</p>`,
            headers: {
                'X-Priority': '1 (Highest)',
                'X-MSMail-Priority': 'High',
                'Importance': 'High'
            }
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error in sendMail:", error);
                return res.status(500).json({ error: "Failed to send OTP", errorMsg: error.message });
            } else {
                console.log("Email sent:", info.response);
                return res.status(200).json({ message: "OTP sent to your email" });
            }
        });
    } catch (err) {
        console.error("Error in sendOtp:", err);
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