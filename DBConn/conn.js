const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/gymBackend")
    .then(() => {
        console.log("Connected to MongoDB successfully & PeaceFully");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB plz get some help from CO-pilot", err);
    });