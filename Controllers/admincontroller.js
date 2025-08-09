const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Gym = require('../Modals/gym.js');
require('dotenv').config();

// ✅ Removed top-level res.cookie (that caused crash)

// Cookie options (reusable)
const cookieOptions = {
  httpOnly: true,
  secure: true,      // must be true for cross-site cookies over HTTPS
  sameSite: "none"   // must be 'none' for cross-site cookies
};

// ================= SUPER ADMIN LOGIN =================
exports.superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const gym = await Gym.findOne({ email });
        if (!gym) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }

        if (gym.role !== 'admin') {
            return res.status(403).json({ error: "Sorry You are not Admin" });
        }

        if (gym && await bcrypt.compare(password, gym.password)) {
            const token = jwt.sign(
                {
                    gym_id: gym._id,
                    email: gym.email,
                    gymName: gym.gymName,
                    role: gym.role
                },
                process.env.JWT_SECRET_KEY
            );

            // ✅ cookie is now set here (not top-level)
            res.cookie("cookie_token", token, { ...cookieOptions, maxAge: 48 * 60 * 60 * 1000 });

            res.json({ message: "Login Successful", success: "true", gym, token });
        } else {
            res.status(400).json({ error: "Invalid Credentials" });
        }

    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).json({ error: "Server Error in login", errorMsg: err.message });
    }
};

// ================= CHANGE GYM STATUS =================
exports.changeGymStatus = async (req, res) => {
    try {
        const token = req.cookies.cookie_token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: Only admin can change gym status" });
        }

        const { gymId, status } = req.body;
        if (!gymId || !status) {
            return res.status(400).json({ error: "gymId and status are required" });
        }

        const gym = await Gym.findById(gymId);
        if (!gym) {
            return res.status(404).json({ error: "Gym not found" });
        }

        if (status === 'approved' && gym.status === 'approved') {
            return res.status(400).json({ error: `Email already sent for status "approved"` });
        }

        if (gym.status === 'approved' && status === 'rejected') {
            return res.status(400).json({ error: "Cannot reject a gym that is already approved" });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        if (status === 'approved') {
            const mailOptions = {
                from: `"Gym Management System" <${process.env.SENDER_EMAIL}>`,
                to: gym.email,
                subject: 'Gym Approval Notification',
                text: `Congratulations! Your gym has been approved. You can now access all features.`,
                html: `<p>Congratulations! <u> <b>${gym.userName}</b> </u>  Your gym <u> <b>${gym.gymName}</b>  </u>  has been <b>approved</b>. You can now access all features.</p>`,
                headers: {
                    'X-Priority': '1 (Highest)',
                    'X-MSMail-Priority': 'High',
                    'Importance': 'High'
                }
            };

            try {
                await transporter.sendMail(mailOptions);
                gym.status = 'approved';
                await gym.save();
                return res.json({ message: "Gym status updated to approved and email sent", gym });
            } catch (emailErr) {
                return res.status(500).json({ error: "Failed to send the email. Status not updated. Try again." });
            }
        } else if (status === 'rejected') {
            gym.status = 'rejected';
            await gym.save();

            const mailOptions = {
                from: `"Gym Management System" <${process.env.SENDER_EMAIL}>`,
                to: gym.email,
                subject: 'Gym Registration Rejected',
                text: `We regret to inform you that your gym "${gym.gymName}" registration has been rejected.`,
                html: `<p>We regret to inform you that your gym <b>${gym.gymName}</b> registration has been <b>rejected</b>.</p>`,
                headers: {
                    'X-Priority': '1 (Highest)',
                    'X-MSMail-Priority': 'High',
                    'Importance': 'High'
                }
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (emailErr) {
                console.error("Failed to send rejection email:", emailErr);
            }

            return res.json({ message: "Gym rejected and status updated", gym });
        } else {
            return res.status(400).json({ error: "Invalid status value" });
        }
    } catch (err) {
        console.error("Error updating gym status:", err);
        res.status(500).json({ error: "Server Error", errorMsg: err.message });
    }
};

// ================= GET PENDING GYMS =================
exports.getPendingGyms = async (req, res) => {
    try {
        const token = req.cookies.cookie_token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: Only admin can view gyms" });
        }

        const gyms = await Gym.find({ status: 'pending' }).select('gymName email userName profilePic status');
        res.json({ gyms });
    } catch (err) {
        console.error("Error fetching pending gyms:", err);
        res.status(500).json({ error: "Server Error", errorMsg: err.message });
    }
};

// ================= GET APPROVED GYMS =================
exports.getApprovedGyms = async (req, res) => {
    try {
        const token = req.cookies.cookie_token;
        if (!token) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: "Forbidden: Only admin can view gyms" });
        }

        const gyms = await Gym.find({ status: 'approved', role: 'gym', isEmailVerified: true })
            .select('gymName email userName profilePic status');
        res.json({ gyms });
    } catch (err) {
        console.error("Error fetching approved gyms:", err);
        res.status(500).json({ error: "Server Error", errorMsg: err.message });
    }
};

// ================= SUPER ADMIN LOGOUT =================
exports.superAdminLogout = (req, res) => {
    try {
        res.clearCookie("cookie_token", {
            httpOnly: true,
            sameSite: "lax",
            secure: false // Set to true if using HTTPS
        });
        res.json({ message: "Logout successful" });
    } catch (err) {
        console.error("Error in logout:", err);
        res.status(500).json({ error: "Server Error in logout", errorMsg: err.message });
    }
};
