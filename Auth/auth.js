// filepath: e:\MiniProject_Backend_Contirbution\gms-backend\Auth\auth.js
module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        // Example: Mock token verification logic
        // Replace this with actual token verification (e.g., using JWT)
        req.gym = { _id: 'exampleGymId' }; // Mock gym ID for demonstration
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid Token' });
    }
};