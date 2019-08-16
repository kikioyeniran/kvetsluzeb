const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const multer = require('multer');
const path = require('path');

//Bring in Cleaner Models
let Cleaner =  require('../../models/cleaner');
let CleanerDetails =  require('../../models/cleanerDetails');

//Bring in Client Model
let ClientDetails =  require('../../models/clientDetails');

//Bring in Client Wallet Model
let ClientWallet = require('../../models/clientWallet');


//Bring in Cleaner Wallet Model
let CleanerWallet = require('../../models/cleanerWallet');

//Bring in Cleaning Schedule Model
let CleaningSchedule =  require('../../models/cleaningSchedule');

router.get('/:scheduleID/:cleanerID/:clientID', (req,res)=>{
    let scheduleID = req.params.scheduleID;
    let cleanerID = req.params.cleanerID;
    let clientID = req.params.clientID;

    CleaningSchedule.findById(scheduleID, (err, schedule)=>{
        if(err){
            console.log(err)
        }
        else{
        let paymentUpdate = {};
        var totalCharge = schedule.totalCharge;
        var cleanerIncome = schedule.cleanerIncome;
        var dblastClean = schedule.lastClean[0];
        var dbcurrentClean = schedule.currentClean[0];
        var increment = schedule.currentClean[0].increment;
        var newCurrentDate = schedule.currentClean[0].nextCleanDate;
        var nextCleanDate = new Date().setDate(newCurrentDate.getDate() + increment);
        var nextCleanDate = new Date(nextCleanDate);
        //console.log(dbcurrentClean.currentCleanDate);
        // console.log(newCurrentDate, ' ', nextCleanDate);
        var lastClean = [{
            cleanStatus : true,
            paidStatus : false,
            requestStatus : true,
            lastCleanDate  : dbcurrentClean.currentCleanDate
        }];
        var currentClean = [{
                cleanStatus : true,
                paidStatus : false,
                requestStatus : true,
                currentCleanDate  : newCurrentDate,
                nextCleanDate: nextCleanDate,
                increment: increment
        }]
        //console.log(lastClean, ' ', currentClean);
        paymentUpdate.lastClean = lastClean;
        paymentUpdate.currentClean = currentClean;
        var newLastCleanDate = dbcurrentClean.currentCleanDate;
        console.log(newLastCleanDate);
        var query = {_id: scheduleID};
        CleaningSchedule.updateOne(query, paymentUpdate, (err) =>{
                if(err){
                    console.log(err);
                    return;
                }else {
                    //console.log('Schedule Updated');
                    let queryWallet = {cleanerID : req.params.cleanerID}
                    Cleaner.findById(req.params.cleanerID, (err, cleaner)=>{
                        var CleanSpecID = cleaner.cleanerID;
                        // console.log(CleanSpecID);
                        let queryWallet2 = {cleanerID: CleanSpecID}
                        CleanerWallet.findOne((queryWallet2), (err, walletFound)=>{
                            let wallet = {};
                            wallet.totalIncome = totalCharge + walletFound. totalIncome;
                            wallet.expectedIncome = totalCharge;
                            CleanerWallet.updateOne(queryWallet, wallet, (err) =>{
                                //console.log(clientID);
                                let clientQuery = {clientID: clientID}
                                ClientWallet.findOne((clientQuery),(err, clientFound)=>{
                                    let clientWallet = {};
                                    var pendingPay = {
                                        cleanDate: newLastCleanDate,
                                        cleanerID: cleanerID,
                                        cost: totalCharge
                                    }
                                    clientWallet.totalPaid = totalCharge + clientFound.totalPaid;
                                    clientWallet.pendingPay = pendingPay;
                                    ClientWallet.updateOne(clientQuery, clientWallet,(err)=>{
                                        if(err){
                                            console.log(err);
                                            return;
                                        }else {
                                            //console.log('wallet found and updated');
                                            //req.flash('success', 'Account Updated');
                                            res.redirect('/cleaner/dashboard/cleaner_calendar/'+cleanerID);
                                        }
                                    })
                                })
                            });
                        })
                    })


                }
            });
        }
    });
})

module.exports = router;