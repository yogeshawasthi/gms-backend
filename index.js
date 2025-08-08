const express = require('express');
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./DBConn/conn.js');

connectDB(); // Connect to MongoDB

app.use(cors({
  origin: 'https://gym-8e43s0pu0-yogesh-awasthis-projects.vercel.app', // your Vercel frontend URL
  credentials: true
}));



const PORT = process.env.PORT;

app.use(cookieParser());

require('./DBConn/conn.js');

const GymRoutes = require('./Routes/gym');
const MembershipRoutes = require('./Routes/membership');
const MemberRoutes = require('./Routes/member');
const { connect } = require('mongoose');

app.use(express.json()); // This is required to parse JSON data in req.body

app.use('/auth', GymRoutes);
app.use('/plans', MembershipRoutes);
app.use('/members', MemberRoutes); // Add this line to use the member routes

// const seedSuperAdmin = require('./seedSuperAdmin.js');
// seedSuperAdmin(); // Seed the super admin

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});