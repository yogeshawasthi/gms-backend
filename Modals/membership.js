const mongoose = require("mongoose");


const membershipSchema = mongoose.Schema({
    months: {
        type: Number,
        required: true,
    },  
    price: {
        type: Number,
        required: true,
    },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'gym',required: true }, 


})

const modaalMembership = mongoose.model("membership", membershipSchema);

module.exports = modaalMembership;