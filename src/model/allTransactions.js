import mongoose from 'mongoose';

//All Transactions schema
const AllTransactionsSchema = mongoose.Schema({
    clientID:{
        type: String,
        required: true
    },
    clientName:{
        type: String,
        required: true
    },
    cleanerID:{
        type: String,
        required: true
    },
    cleanerName:{
        type: String,
        required: true
    },
    totalPaid:{
        type: Number,
        required: true,
        default: 0
    },
    Date:{
        type: Date,
        required: true
    },
    updated:{
        type: Date,
        default: Date.now
    }
});
const AllTransactions = module.exports = mongoose.model('allTransactions', AllTransactionsSchema);