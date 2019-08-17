import mongoose from 'mongoose';

//Cleaning Schedule Schema
let CleaningScheduleSchema = mongoose.Schema({
    // clientDetails:[
    //     {
    //         client:{
    //             type: mongoose.Schema.Types.ObjectId,
    //             ref: 'client_details'
    //         }
    //     }
    // ],
    clientDetails:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'client_details'
    }],
    cleanerID:{
        type: String,
        required: true
    },
    cleanerName:{
        type: String,
        //required: true
    },
    dateFirstClean:{
        type: Date
    },
    lastClean:[
        {
            cleanStatus:{
                type: Boolean,
                default: false
            },
            paidStatus:{
                type:  Boolean,
                default: false
            },
            requestStatus:{
                type: Boolean
            },
            lastCleanDate:{
                type: Date
            }
        }
    ],
    currentClean:[
        {
            cleanStatus:{
                type: Boolean,
                default: false
            },
            paidStatus:{
                type:  Boolean,
                default: false
            },
            requestStatus:{
                type: Boolean
            },
            currentCleanDate:{
                type: Date
            },
            nextCleanDate:{
                type: Date
            },
            increment:{
                type:Number
            }
        }
    ],
    cleanerIncome:{
        type: Number
    },
    extraTasks:{
        type: Array
    },
    totalHours:{
        type: Number
    },
    totalCharge:{
        type: Number
    },
    updated:{
        type: Date,
        default: Date.now
    }
});

let CleaningSchedule = module.exports = mongoose.model('cleaningSchedule', CleaningScheduleSchema);