import mongoose from 'mongoose';

//client schema
const ClientWalletSchema = mongoose.Schema({
    clientID:{
        type: String,
        required: true
    },
    pendingPay:[
        {
            cleanDate:{
                type: Date,
            },
            cleanerID:{
                type:  String,
                default: ""
            },
            cost:{
                type: Number,
                default: 0
            },
            paidStatus:{
                type: Boolean,
                default: false
            }
        }
    ],
    totalPaid:{
        type: Number,
        required: true,
        default: 0
    },
    updated:{
        type: Date,
        default: Date.now
    }
});
const ClientWallet = module.exports = mongoose.model('clientWallet', ClientWalletSchema);
