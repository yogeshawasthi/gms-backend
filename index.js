const express = require('express');
const app = express();

const PORT = 4000;

require('./DBConn/conn.js');

const GymRoutes = require('./Routes/gym');
const MembershipRoutes = require('./Routes/membership');

app.use(express.json()); // Middleware to parse JSON requests
app.use('/auth', GymRoutes);
app.use('/plans', MembershipRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`);
});