// filepath: e:\MiniProject_Backend_Contirbution\gms-backend\Auth\auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.cookie_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded token:", decoded); // Debugging
        req.gym = decoded; // Attach all token data to the request
        next();
    } catch (err) {
        console.error("Error verifying token:", err); // Debugging
        return res.status(401).json({ error: "Invalid Token", errorMsg: err.message });
    }
};