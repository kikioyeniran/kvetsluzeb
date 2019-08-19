const express = require('express');
const router = express.Router();
//Models
let Client =  require('../../models/client');
let ClientDetails =  require('../../models/clientDetails');
let Cleaner =  require('../../models/cleaner');
let CleanerDetails =  require('../../models/cleanerDetails');
let ClientWallet =  require('../../models/clientWallet');
let Transactions =  require('../../models/allTransactions');
let CleaningSchedule = require('../../models/cleaningSchedule');

router.post('', (req, res)=>{
    console.log('form submitted');
    const clientID = req.body.clientID;
    const clientName = req.body.clientName;
    const cleanerID = req.body.cleanerID;
    const cleanDate = req.body.cleanDate;
    const totalPay = req.body.totalPay;
    clientQuery = {clientID: clientID};
    Client.findOne((clientQuery), (err, clients)=>{
        var mainID = clients._id;
        Cleaner.findById(cleanerID, (err, mainCleaner)=>{
            let walletUpdate = {};
            var pendingPay = [];
            walletUpdate.pendingPay = pendingPay;
            let walletQuery = {pendingPay:[{cleanerID: cleanerID}]};
            //Update Client Wallet and Set Pending Pay to empty
            ClientWallet.updateOne(walletQuery, walletUpdate, (err, updWallet)=>{
                var queryCleaner = {cleanerID: mainCleaner.cleanerID};
                // Get Cleaner Details
                CleanerDetails.findOne((queryCleaner), (err, cleanerDetails)=>{
                    console.log(cleanerDetails.fullName);
                    cleanerName = cleanerDetails.fullName
                    req.checkBody('clientID', 'clientID is required').notEmpty();
                    req.checkBody('clientName', 'clientName is required').notEmpty();
                    req.checkBody('cleanerID', 'clientPhone is required').notEmpty();
                    req.checkBody('cleanDate', 'Date is required').notEmpty();
                    req.checkBody('totalPay', 'totalPay is required').notEmpty();

                    let errors = req.validationErrors();
                    if(errors){
                        console.log(errors)
                    }else{
                        let scheduleQuery = {cleanerID: cleanerID};
                        let scheduleUpdate = {};
                        var newStatus = {
                            paidStatus: true
                        }
                        scheduleUpdate.lastClean = newStatus;
                        CleaningSchedule.updateOne(scheduleQuery, scheduleUpdate, (err, schedule)=>{
                            //console.log(schedule.lastClean[0].lastCleanDate);
                            if(err){
                                console.log(err)
                            }else{
                                let newTransaction = new Transactions({
                                    clientID: clientID,
                                    clientName: clientName,
                                    cleanerID: cleanerID,
                                    cleanerName: cleanerName,
                                    Date: cleanDate,
                                    totalPaid: totalPay,
                                });

                                newTransaction.save((err) =>{
                                    if(err){
                                        console.log(err);
                                        return;
                                    }else {
                                        req.flash('success', 'Transaction Completed');
                                        res.redirect('/client/success/'+mainID);
                                    }
                                });
                            }
                        })
                    }
                })
            })
        })
    })
});

module.exports = router;
