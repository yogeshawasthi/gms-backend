const express = require('express');
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./DBConn/conn.js');

connectDB(); // Connect to MongoDB

const allowedOrigins = [
  'http://localhost:3000',
  'https://gym-one-gamma.vercel.app' // ✅ new hosted frontend link
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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