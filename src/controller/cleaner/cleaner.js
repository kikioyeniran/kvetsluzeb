import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { validateToken } from '../../utils';

//Bring in Cleaner Models
import Cleaner from '../../model/cleaner/cleaner';
import CleanerDetails from '../../model/cleaner/cleanerDetails';

//Bring in Client Model
import ClientDetails from '../../model/client/clientDetails';

//Bring in Client Wallet Model
import ClientWallet from '../../model/client/clientWallet';

//Bring in Cleaner Wallet Model
import CleanerWallet from '../../model/cleaner/cleanerWallet';

//Bring in Cleaning Schedule Model
import CleaningSchedule from '../../model/cleaningSchedule';

import Requests from '../../model/booking/requests';



export default ({config, db}) =>{
    let api = Router();


    // **********************************************
    // ******* CLEANER PAYMENT REQUESTS *************
    // **********************************************
    api.get('/:scheduleID/:cleanerID/:clientID', (req,res)=>{
        let scheduleID = req.params.scheduleID;
        let cleanerID = req.params.cleanerID;
        let clientID = req.params.clientID;
        let result = {};
        let statusCode = 200;

        CleaningSchedule.findById(scheduleID, (err, schedule)=>{
            if(err){
                result.error = err;
                result.statusCode = 404;
                res.status(statusCode).send(result);
                // console.log(err)
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
                                                result.error = err;
                                                result.statusCode = 404;
                                                res.status(statusCode).send(result);
                                            }else {
                                                //console.log('wallet found and updated');
                                                //req.flash('success', 'Account Updated');
                                                let message = 'Successful please redirect to User dashboard'

                                                result.error = err;
                                                result.statusCode = statusCode;
                                                result.message = message
                                                res.status(statusCode).send(result);
                                                // res.redirect('/cleaner/dashboard/cleaner_calendar/'+cleanerID);
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

    // **********************************************
    // ******* CLEANER WALLET DETAILS ***************
    // **********************************************
    // For Editing the cleaner wallet details on the dahboard
    api.post('/:cleanerID/:id', validateToken, (req, res) =>{
        //console.log('code is here');
        let result = {};
        let statusCode = 200;
        let wallet = {};
        wallet.acctName = req.body.acctName;
        wallet.bank = req.body.bank;
        wallet.acctNumber = req.body.acctNumber;
        let query = {cleanerID : req.params.cleanerID}

        CleanerWallet.updateOne(query, wallet, (err) =>{
            if(err){
                console.log(err);
                return;
            }else {
                console.log('wallet and updated');
                //req.flash('success', 'Account Updated');
                res.redirect('/cleaner/dashboard/wallet/'+req.params.id);
            }
        });
    });


//Edit Request and create schedule Process
api.get('/:clientID/:cleanerID/:requestID', (req, res) =>{
    let clientID = req.params.clientID;
    let cleanerID = req.params.cleanerID;
    let requestID = req.params.requestID;
    let result = {};
    let statusCode = 200;

    let request = {};
    request.status = true;
    request.confirmedCleanerID = cleanerID;
    request
    let query = {_id : requestID};
    Requests.updateOne(query, request, (err) =>{
        if(err){
            result.error = err;
            result.statusCode = 400;
            res.status(statusCode).send(result);
        }else {
            console.log('found and updated', clientID);

            //req.flash('success', 'Account Updated');
            query2 = {_id: requestID}
            Requests.find((query2), (err, clientRequest)=>{
                if(err){
                    console.log(err)
                }else{
                    //console.log(clientRequest[0].cleanerID)
                    var dateFirstClean = clientRequest[0].dateFirstClean;
                    var frequency = clientRequest[0].frequency;
                    var increment = 0;

                    if(frequency == "weekly"){
                        var nextCleanDate = new Date().setDate(dateFirstClean.getDate() + 7);
                        var nextCleanDate = new Date(nextCleanDate);
                        var followingDate = new Date().setDate(nextCleanDate.getDate() + 7);
                        var followingDate = new Date(followingDate);
                        var increment = 7;
                        //console.log(nextCleanDate);
                    }
                    if(frequency == "fortnightly"){
                        var nextCleanDate = new Date().setDate(dateFirstClean.getDate() + 14);
                        var nextCleanDate = new Date(nextCleanDate);
                        var followingDate = new Date().setDate(nextCleanDate.getDate() + 14);
                        var followingDate = new Date(followingDate);
                        var increment = 14;
                        //console.log(nextCleanDate);
                    }
                    if(frequency == "one-off"){
                        var nextCleanDate = new Date(dateFirstClean);
                        var increment = 0;
                        //console.log(nextCleanDate);
                    }
                    Cleaner.findById(cleanerID, (err, cleanerDetail)=>{
                        //console.log(cleanerDetail.cleanerID);
                        query = {cleanerID: cleanerDetail.cleanerID}
                        CleanerDetails.findOne((query), (err, newCleaner)=>{
                            var cleanerCharge = newCleaner.income;
                            var hours = clientRequest[0].hours
                            if(hours == "more"){
                                var hourCost = parseFloat(client.Request[0].moreHours);
                            }else{
                                var hourCost = parseFloat(clientRequest[0].hours);
                            }
                            var extraTasks = clientRequest[0].extraTasks[0];
                            var result = extraTasks.split(",");
                            var extraTaskCost = result.length;
                            if(extraTaskCost <=2){
                                hourCost = hourCost + 0.5;
                            }
                            if(extraTaskCost >2){
                                hourCost = hourCost + 1;
                            }
                            var cleanerIncome = newCleaner.income * hourCost;
                            query2 = {clientID: req.params.clientID};
                            ClientDetails.findOne((query2), (err, clientDetails)=>{
                                //console.log(req.params.clientID, ' + ', clientDetails);
                                var clientID = clientDetails._id;
                                let newSchedule = new CleaningSchedule({
                                    clientDetails: clientID,
                                    clientName: clientRequest[0].clientName,
                                    cleanerID: cleanerID,
                                    dateFirstClean: dateFirstClean,
                                    currentClean:[
                                        {
                                            currentCleanDate: dateFirstClean,
                                            nextCleanDate: nextCleanDate,
                                            increment: increment
                                        }
                                    ],
                                    extraTasks: extraTasks,
                                    cleanerIncome: cleanerCharge,
                                    totalHours: hourCost,
                                    totalCharge: cleanerIncome
                                });
                                newSchedule.save((err)=>{
                                    if(err){
                                        result.error = err;
                                        result.statusCode = 400;
                                        res.status(statusCode).send(result);
                                    }else{
                                        let message = 'Cleaning Request Accepted'
                                        result.message = message ;
                                        result.statusCode = 400;
                                        res.status(statusCode).send(result);

                                        //console.log(cleanerID);

                                        // TODO: Ask Sir KIKI what this next line is for
                                        // res.redirect('/cleaner/dashboard/cleaner_calendar/'+encodeURIComponent(req.params.cleanerID));
                                    }
                                })
                            })
                        });
                    });
                }
            });
        }
    });
});

    return api;
}
