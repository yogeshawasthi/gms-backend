require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.Mongo_DB_URI, {
        });
        console.log("Connected to MongoDB successfully & PeaceFully");
    } catch (err) {
        console.log("Error connecting to MongoDB plz get some help from CO-pilot", err);
    }
};

module.exports = connectDB;