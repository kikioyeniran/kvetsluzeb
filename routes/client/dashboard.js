const express = require('express');
const router = express.Router();
var empty = require('is-empty');
const keys = require('../../config/keys');
const stripe = require('stripe')(keys.stripeSecretKey);

//Bring in Client Models
let Client =  require('../../models/client');
let ClientDetails =  require('../../models/clientDetails');
let ClientWallet =  require('../../models/clientWallet');
let AllTransactions =  require('../../models/allTransactions');

//Client Dashboard route
router.get('/home/:id', (req, res) =>{
    Client.findById(req.params.id, (err, client) =>{
        //console.log(client)
        var query = {clientID: client.clientID};
        ClientDetails.find((query), (err, client_details)=>{
            //console.log(client_details[0]);
            res.render('client/client_dashboard',{
                client: client,
                clientDetails: client_details[0]
            });
        });
    });
});


//Renew Booking Route
router.get('/renew/:id', (req, res) =>{
    Client.findById(req.params.id, (err, client) =>{
        //console.log(client)
        var query = {clientID: client.clientID};
        ClientDetails.find((query), (err, client_details)=>{
            //console.log(client_details[0]);
            res.render('client/client_renewbooking',{
                client: client,
                clientDetails: client_details[0]
            });
        });
    });
});

//Client FAQs Route
router.get('/client_faq/:id', (req, res) =>{
    Client.findById(req.params.id, (err, client) =>{
        //console.log(client)
        var query = {clientID: client.clientID};
        ClientDetails.find((query), (err, client_details)=>{
            //console.log(client_details[0]);
            res.render('client/client_faq',{
                client: client,
                clientDetails: client_details[0]
            });
        });
    });
});

//Client Finance Page route
router.get('/wallet/:id', (req, res) =>{
    Client.findById(req.params.id, (err, client) =>{
        //console.log(client)
        var query = {clientID: client.clientID};
        ClientDetails.find((query), (err, client_details)=>{
            //console.log(client_details[0]);
            ClientWallet.findOne((query), (err,clientWallet)=>{
                var  pending;
                var costStatus = false;
                if(empty(clientWallet.pendingPay)){
                    costStatus = true;
                    pending = true;
                    console.log('pending pay is empty')
                }else{
                    if(empty(clientWallet.pendingPay[0].cost)){
                        costStatus = true;
                        //pending = false;
                        console.log('cost Status is empty')
                    }
                    pending = false;
                    //costStatus = false;
                    console.log('pending pay is not empty ', clientWallet.pendingPay[0].cost, ' ', costStatus)
                }

                //console.log(costStatus)
                res.render('client/client_finance',{
                    client: client,
                    clientDetails: client_details[0],
                    wallet: clientWallet,
                    costStatus: costStatus,
                    pending: pending,
                    stripePublishableKey: keys.stripePublishableKey
                });
             })
        });
    });
});

//All Transactions Route
router.get('/transactions/:id', (req, res) =>{
    Client.findById(req.params.id, (err, client) =>{
        //console.log(client)
        var query = {clientID: client.clientID};
        ClientDetails.find((query), (err, client_details)=>{
            /if(err){
                console.log(err);
                return;
            }else {
                console.log('found and updated');
                req.flash('success', 'Account Updated');
                res.redirect('/client/dashboard/home/'+req.params.id);
            }/console.log(client_details[0]);
            AllTransactions.find((query), (err, transactions)=>{
                var noTransaction = false;
                if(empty(transactions)){
                    noTransaction = true;
                }
                // console.log(transactions[0].cleaner);
                res.render('client/allTransactions',{
                    client: client,
                    clientDetails: client_details[0],
                    transactions: transactions,
                    transactionStatus: noTransaction
                });
            })
        });
    });
});

//Client Finance Page route
router.get('/client_invoice', (req, res) =>{
    res.render('client/client_invoice')
});
//Client Calendar Page route
router.get('/client_calendar', (req, res) =>{
    res.render('client/client_calendar')
});
//Client FAQs Page route
router.get('/client_faq', (req, res) =>{
    res.render('client/client_faq')
});


module.exports = router;
