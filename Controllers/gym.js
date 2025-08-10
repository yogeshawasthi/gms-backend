const Gym = require('../Modals/gym.js');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const Member = require('../Modals/member.js');


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

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

        
        // Send verification email
        const verificationUrl = `${process.env.BACKEND_URL || "http://localhost:4000"}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
        const mailOptions = {
            from: `"Gym Management System" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email',
            html: `
                <p>Welcome to Gym Management System!</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 5 minutes.</p>
                <p>If you did not register, please ignore this email.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending verification email:", error);
                return res.status(500).json({ error: "Failed to send verification email , but we received your request. wait for approval", errorMsg: error.message });
            
            } else {
                console.log("Verification email sent:", info.response);
                return res.status(201).json({
                    message: "User Registered Successfully. Please check your email to verify your account.",
                    success: "yes",
                    data: newGym
                });
            }
        });

        const newGym = new Gym({
            userName,
            password: hashedPassword,
            gymName,
            profilePic,
            email,
            isEmailVerified: false,
            emailVerificationToken: verificationToken,
            emailVerificationTokenExpires: verificationTokenExpires
        });
       

        await newGym.save();
        

    } catch (err) {
        console.error("Error in register:", err); // Log error for debugging
        res.status(500).json({ error: "Server Error in register", errorMsg: err.message });
    }
};

const cookieOptions = {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS
    sameSite: 'Lax',
    // Adjust as needed

};
exports.login = async (req, res) => {
    try {
        const { userName, password } = req.body;
        // const status = await Gym.

        // Validate request body
        if (!userName || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
         
        

        const gym = await Gym.findOne({ userName });
        if (!gym) {
            return res.status(400).json({ error: "Invalid Credentials" });
        }

        if (!gym.isEmailVerified) {
            return res.status(403).json({ error: "Please verify your email before logging in." });
        }

        if (gym.status !== 'approved') {
            return res.status(403).json({ error: "Your gym account is not approved yet. Please wait for admin approval." });
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

            // Set the token in a cookie with 24 hour expiry
            res.cookie("cookie_token", token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 });

            res.json({ message: "Login Successful", success: "true", gym, token });
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

exports.verifyEmail = async (req, res) => {
    try {
        const { email, token } = req.query; // Use query for GET

        if (!email || !token) {
            return res.status(400).json({ error: "Invalid verification link." });
        }

        const gym = await Gym.findOne({
            email: email.toLowerCase(),
            emailVerificationToken: token,
            emailVerificationTokenExpires: { $gt: Date.now() }
        });

        if (!gym) {
            return res.status(400).json({ error: "Verification link is invalid or has expired." });
        }

        if (gym.isEmailVerified) {
            return res.status(400).json({ error: "Email is already verified." });
        }

        gym.isEmailVerified = true;
        gym.emailVerificationToken = undefined;
        gym.emailVerificationTokenExpires = undefined;
        await gym.save();

        res.status(200).json({ message: "Email verified successfully. Please wait for admin approval." });
    } catch (err) {
        console.error("Error in verifyEmail:", err);
        res.status(500).json({ error: "Server Error in verifyEmail", errorMsg: err.message });
    }
};

exports.sendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }
        const gym = await Gym.findOne({ email: email.toLowerCase() });
        if (!gym) {
            return res.status(404).json({ error: "Email not found." });
        }
        if (gym.isEmailVerified) {
            return res.status(400).json({ error: "Email is already verified." });
        }

        // Generate new token and expiry (10 minutes)
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        gym.emailVerificationToken = verificationToken;
        gym.emailVerificationTokenExpires = verificationTokenExpires;
        await gym.save();

        // Send verification email
        const verificationUrl = `${process.env.BACKEND_URL || "https://gms-backend-u5x0.onrender.com"}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
        const mailOptions = {
            from: `"Gym Management System" <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email',
            html: `
                <p>Welcome to Gym Management System!</p>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 1 minute.</p>
                <p>If you did not register, please ignore this email.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending verification email:", error);
                return res.status(500).json({ error: "Failed to send verification email", errorMsg: error.message });
            } else {
                console.log("Verification email sent:", info.response);
                return res.status(200).json({
                    message: "Verification email sent. Please check your inbox.",
                });
            }
        });
    } catch (err) {
        console.error("Error in sendVerificationEmail:", err);
        res.status(500).json({ error: "Server Error in sendVerificationEmail", errorMsg: err.message });
    }
};


exports.getGymReport = async (req, res) => {
    try {
        const { gymId } = req.params;
        const months = parseInt(req.query.months) || 1;

        // Validate gym
        const gym = await Gym.findById(gymId);
        if (!gym) {
            return res.status(404).json({ error: "Gym not found" });
        }

        // Calculate date range
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const fromDate = new Date(now);
        fromDate.setMonth(fromDate.getMonth() - (months - 1));
        fromDate.setDate(1);

        // Fetch all members for this gym
        const allMembers = await Member.find({ gym: gymId }).populate('membership');

        // Filter by your logic
        const activeMembers = allMembers.filter(m =>
            m.status === "Active" && new Date(m.nextBillDate) >= now
        );

        const inactiveMembers = allMembers.filter(m =>
            ["Inactive", "Pending"].includes(m.status) && new Date(m.nextBillDate) >= now
        );

        // Expired: nextBillDate is in the past and within the selected period
        const expiredMembers = allMembers.filter(m => {
            const nextBill = new Date(m.nextBillDate);
            return (
                ["Active", "Pending", "Inactive"].includes(m.status) &&
                nextBill < now &&
                nextBill >= fromDate
            );
        });

        const totalMembers = allMembers.length;
        const totalIncome = allMembers.reduce((sum, m) => sum + (m.membership?.price || 0), 0);

        res.json({
            gymName: gym.gymName,
            period: `${months} month(s)`,
            from: fromDate,
            to: now,
            totalMembers,
            totalIncome,
            activeMembers: activeMembers.map(m => ({
                memberId: m._id,
                userName: m.name,
                email: m.email,
                phone: m.mobileNo,
                plan: m.membership?.months ? `${m.membership.months} Months` : "",
                planPrice: m.membership?.price || 0,
                status: m.status,
                joiningDate: m.createdAt
            })),
            inactiveMembers: inactiveMembers.map(m => ({
                memberId: m._id,
                userName: m.name,
                email: m.email,
                phone: m.mobileNo,
                plan: m.membership?.months ? `${m.membership.months} Months` : "",
                planPrice: m.membership?.price || 0,
                status: m.status,
                joiningDate: m.createdAt
            })),
            expiredMembers: expiredMembers.map(m => ({
                memberId: m._id,
                userName: m.name,
                email: m.email,
                phone: m.mobileNo,
                plan: m.membership?.months ? `${m.membership.months} Months` : "",
                planPrice: m.membership?.price || 0,
                status: "Expired", // Always show as Expired
                joiningDate: m.createdAt
            }))
        });
    } catch (err) {
        console.error("Error in getGymReport:", err);
        res.status(500).json({ error: "Server Error in getGymReport", errorMsg: err.message });
    }
};