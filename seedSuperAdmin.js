const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./DBConn/conn.js");
const User = require("./Modals/gym.js"); // Or use "./Modals/member.js" if your admin is in member.js

dotenv.config(); // Load environment variables

const seedSuperAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ role: "admin" });
  if (existing) {
    console.log("Admin already exists.");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("Password@123", 10);

  const superAdmin = new User({
    userName: "Yogesh Awasthi",
    email: "yogeshawasthi54321@gmail.com",
    password: hashedPassword,
    role: "admin",
    gymName: "Gym World", // <--'
    profilePic: "https://your-default-image-url.com/profile.png",
    status: "approved", // Optional, set default status
  });

  await superAdmin.save();
  console.log("✅ Admin created successfully.");
  process.exit();
};

module.exports = seedSuperAdmin;
