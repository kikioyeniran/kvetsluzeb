import { Router } from 'express';
import mongoose from 'mongoose';
import config from '../../config';
const stripe = require('stripe')(config.stripeSectretKey);

import { validateToken } from '../../utils';

import Client from '../../model/client/client';
import ClientDetails from '../../model/client/clientDetails';

import Cleaner from '../../model/cleaner/cleaner'
import CleanerDetails from '../../model/cleaner/cleanerDetails';
import ClientWallet from '../../model/client/clientWallet';
import Transactions from '../../model/allTransactions';
import CleaningSchedule from '../../model/cleaningSchedule'

// let Client =  require('../../models/client');
// let ClientDetails =  require('../../models/clientDetails');
// let Cleaner =  require('../../models/cleaner');
// let CleanerDetails =  require('../../models/cleanerDetails');
// let ClientWallet =  require('../../models/clientWallet');
// let Transactions =  require('../../models/allTransactions');
// let CleaningSchedule = require('../../models/cleaningSchedule');

export default ({config, db}) => {
    let api  = Router();

    // client Dashboard Route
    // 'api/v1/client/dashboard/:id'
    // api.get('/dashboard/:id', (req, res) => {
    //     Client.findById(req.params.id, (err, client) => {

    //         let query = {clientID: client.clientID};
    //         ClientDetails.find((query), (err, clientDetails) => {
    //             if (err) {
    //                 let result = {};
    //                 let status = 400;
    //                 let error = err;
    //                 result.status = status;
    //                 result.error = err;
    //                 res.status(status).send(result);
    //             }
    //             // res.render() --> can come here 
    //             let status = 201;
    //             let result = {};
    //             let currentClient = client;
    //             let currentClientDetails = clientDetails[0];
    //             result.status = status;
    //             result.currentClient = currentClient;
    //             result.currentClientDetails = currentClientDetails;
                
    //             res.status(status).send(result);
    //         });
    //     });
    // });

    api.post('/transaction', validateToken, (req, res)=>{
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
                                        let result = {};
                                        let statusCode = 200;
                                        if (err) {
                                            statusCode = 400;
                                            result.statusCode = statusCode;
                                            result.error = err;
                                            res.status(statusCode).send(result);
                                        }
                                            result.message = 'Transaction Completed';
                                            result.statusCode = statusCode;
                                            result.userID = mainID
                                            res.status(statusCode).send(result);                                        
                                    });
                                }
                            })
                        }
                    })
                })
            })
        })
    });


    // payment success
    api.get('/:clientID', (req, res) =>{
        var clientID = req.params.clientID;
        var revisit  = true;
        let result = {
            'statusCode': 200,
            'revisit': revisit,
            'clientID': clientID
        }

        res.status(result.statusCode).send(result);
        
    });

    api.get('/bookingFinal/:client', validateToken, (req, res) =>{
        // res.render('booking_final');
        // var ID = req.params.client;
        // console.log(ID);
        //var query1 = {clientID: ID};
        Client.findOne(({clientID: req.params.client}), (err, client) =>{
            console.log(client)
            let result = {};
            let statusCode = 200;
            ClientDetails.findOne(({clientID: req.params.client}), (err, client_details)=>{
                console.log(client_details.city);
                var query2 = {city: client_details.city};
                CleanerDetails.find((query2), (err, cleanerDetails)=>{
                    if(empty(cleanerDetails)){                        
                        result.statusCode = statusCode;
                        result.user = client;
                        result.userDetails = client_details
                        res.status(statusCode).send(result);
                        
                    }else{
                        result.statusCode = statusCode;
                        result.user = client;
                        result.cleaner_details = cleanerDetails;
                        result.userDetails = client_details
                        res.status(statusCode).send(result);
                        
                        //console.log(cleanerDetails);
                        // res.render('booking_final',{
                        //     client: client,
                        //     clientDetails: client_details,
                        //     cleanerDetails: cleanerDetails
                        // });
                    }
    
                });
            });
        });
    });
    

    api.post('/renewBooking/:clientID/:id', validateToken, (req, res) =>{
        let client = {};
        client.bedrooms = req.body.bedrooms;
        //console.log(req.body.fullName);
        client.bathrooms = req.body.bathrooms;
        client.extraTasks = req.body.extraTasks;
        client.dateFirstClean = req.body.date;
        client.cleaningHours = req.body.hours;
        client.moreCleaningHours = req.body.more_hours;
        client.apartmentAccess = req.body.access_type;
        client.keyHiddenPin = req.body.keyHiddenPin;
        client.keySafePin = req.body.keySafePin;
        client.cleaningFrequency = req.body.schedule;
        let query = {clientID : req.params.clientID}
        console.log(query);
        console.log(req.params.clientID)
    
        ClientDetails.updateOne(query, client, (err) =>{
            let result = {};
            let statusCode = 200;
                if (err) {
                    statusCode = 400;
                    result.statusCode = statusCode;
                    result.error = err;
                    res.status(statusCode).send(result);
                }
                result.statusCode = statusCode
                result.message = 'Found and updated'
                result.id = req.param.id;
                res.status(statusCode).send(result);
        });
    });


    api.post('/pay', validateToken, (req, res)=>{
        
        let amount = req.body.totalPay * 100;
      
        stripe.customers.create({
          email: req.body.stripeEmail, // customer email
          source: req.body.stripeToken //token for the card
        })
        .then(customer =>
            stripe.charges.create({
              // charge the customer
              amount,
              description: 'Cleaning for a particular cleaner',
              currency: 'eur',
              customer: customer.id
            }))
          .then(charge => res.render('client/success',{
              clientID: req.body.clientID,
              clientName: req.body.clientName,
              cleanerID: req.body.cleanerID,
              cleanDate: req.body.cleanDate,
              totalPay: req.body.totalPay,
              revisit: false
          })) //render the payment successful page
      });
    return api;
}