const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.cookie_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        console.log("Token is missing"); // Debugging
        return res.status(401).json({ error: "Token is missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded Token:", decoded); // Debugging

        if (!decoded.gym_id) {
            console.error("Decoded token does not contain gym_id"); // Debugging
            return res.status(401).json({ error: "Invalid Token: gym_id is missing" });
        }

        req.gym = { _id: decoded.gym_id }; // Attach gym_id to the request
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Error verifying token:", err); // Debugging
        return res.status(401).json({ error: "Invalid Token", errorMsg: err.message });
    }
};