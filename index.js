const express = require('express');
const app = express();

const PORT = 4000;

require('./DBConn/conn.js');

const GymRoutes = require('./Routes/gym');
const MembershipRoutes = require('./Routes/membership');

// Add middleware to parse JSON request bodies
app.use(express.json()); // This is required to parse JSON data in req.body

// Define routes
app.use('/auth', GymRoutes);
app.use('/plans', MembershipRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});