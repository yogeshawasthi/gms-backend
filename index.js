const express = require('express');
const app = express();
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');




app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));



const PORT = process.env.PORT;

app.use(cookieParser());

require('./DBConn/conn.js');

const GymRoutes = require('./Routes/gym');
const MembershipRoutes = require('./Routes/membership');
const MemberRoutes = require('./Routes/member');

app.use(express.json()); // This is required to parse JSON data in req.body

app.use('/auth', GymRoutes);
app.use('/plans', MembershipRoutes);
app.use('/members', MemberRoutes); // Add this line to use the member routes

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});