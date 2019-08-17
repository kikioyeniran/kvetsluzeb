import mongoose from 'mongoose';


//Cleaner schema
const CleanerWalletSchema = mongoose.Schema({
    cleanerID:{
        type: String,
        required: true
    },
    acctNumber:{
        type: Number,
        default: 0
        //required: true
    },
    acctName:{
        type: String,
        default: ""
        //required: true
    },
    bank:{
        type: String,
        default: ''
        //required: true
    },
    totalIncome:{
        type: Number,
        default: 0
    },
    expectedIncome:{
        type: Number,
        default: 0
    },
    paidIncome:{
        type: Number
    },
    cleanerIncome:{
        type: Number,
        required: true
    },
    updated:{
        type: Date,
        default: Date.now
    }
});
const CleanerWallet = module.exports = mongoose.model('cleanerWallet', CleanerWalletSchema);