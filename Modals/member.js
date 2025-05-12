const mongoose = require("mongoose");


const memberSchema = mongoose.Schema({

    name : {
        type: String,
        required: true,
    },
    mobileNo : {
        type: String,
    }, 
    address : { 
        type: String,
    },
    membership : { type: mongoose.Schema.Types.ObjectId, 
        ref: 'membership', 
        required: true 
    },
    gym: { type: mongoose.Schema.Types.ObjectId,
         ref: 'gym', 
         required: true
    },
    profilePic : { 
        type: String,
        required: true,
    },

    status : {
        type: String,
        default: "Active",
    },
    lastPaymentDate : {
        type: Date,
        default: new Date()
    },
        
    nextBillDate : {
        type: Date,
        required: true,

    },

        


   
},{timestamps: true});

const modalMember = mongoose.model("member", memberSchema);

module.exports = modalMember;