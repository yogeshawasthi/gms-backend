const express = require('express');
const app = express();

const PORT = 4000;

require('./DBConn/conn.js');

const GymRoutes = require('./Routes/gym'); // Fixed the missing closing quote

app.use('/auth', GymRoutes);

app.listen(PORT, () => {
    console.log("Server is running on Port 4000");
});