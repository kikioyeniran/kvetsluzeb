import mongoose from 'mongoose';

//Cleaner Detils Schema
let CleanerDetailsSchema = mongoose.Schema({
    postcode:{
        type: String,
        required: true
    },
    extraTasks:{
        type: Array,
        required: true
    },
    dateFirstClean:{
        type: Date
    },
    experience:{
        type: String,
        required: true
    },
    profile:{
        type: String
    },
    mobileNumber:{
        type: Number,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    fullName:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    country:{
        type: String,
        //required: true
    },
    rating:{
        type: Number,
        default: 0
    },
    profilePic:{
        type: String,
        required: true
    },
    nationalID:{
        type: String,
        required: true
    },
    healthInsurance:{
        type: String,
        required: true
    },
    cleanerID:{
        type: String,
        required: true
    },
    income:{
        type: Number,
        required: true
    },
    updated:{
        type: Date,
        default: Date.now
    }
});

let CleanerDetails = module.exports = mongoose.model('Cleaner_details', CleanerDetailsSchema);