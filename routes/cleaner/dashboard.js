const express = require('express');
const router = express.Router();
var empty = require('is-empty');
const date = require('date-and-time');

//Bring in Cleaner Models
// let Cleaner =  require('/projects/kvetsluzeb/models/cleaner')
// let ClientDetails =  require('/projects/kvetsluzeb/models/cleaner_details');

let Cleaner = require('../../models/cleaner');
let CleanerDetails = require('../../models/cleanerDetails');
let ClientDetails = require('../../models/clientDetails');
let Requests = require('../../models/requests');
let CleaningSchedule = require('../../models/cleaningSchedule');
let Wallet = require('../../models/cleanerWallet');


//Cleaner dashboard route
router.get('/home/:id', (req, res) =>{
    Cleaner.findById(req.params.id, (err, cleaner) =>{
        //console.log(cleaner)
        var query = {cleanerID: cleaner.cleanerID};
        CleanerDetails.find((query), (err, cleaner_details)=>{
            //console.log(cleaner_details[0].fullName);
            res.render('cleaner/cleaner_dashboard',{
                cleaner: cleaner,
                cleanerDetails: cleaner_details[0]
            });
        });
    });
});

//Cleaner Finance Page route
router.get('/wallet/:id', (req, res) =>{
    Cleaner.findById(req.params.id, (err, cleaner) =>{
        //console.log(cleaner)
        var query = {cleanerID: cleaner.cleanerID};
        CleanerDetails.find((query), (err, cleaner_details)=>{
            //console.log(cleaner_details);
            Wallet.findOne((query), (err, wallet)=>{
                console.log(cleaner.cleanerID);
                console.log(wallet);
                res.render('cleaner/cleaner_finance',{
                    cleaner: cleaner,
                    cleanerDetails: cleaner_details[0],
                    wallet: wallet
                });
            })
        });
    });
});
//Cleaner Invoice Page route
router.get('/cleaner_invoice/:id', (req, res) =>{
    Cleaner.findById(req.params.id, (err, cleaner) =>{
        console.log(cleaner)
        var query = {cleanerID: cleaner.cleanerID};
        CleanerDetails.find((query), (err, cleaner_details)=>{
            //console.log(cleaner_details[0].fullName);
            res.render('cleaner/cleaner_invoice',{
                cleaner: cleaner,
                cleanerDetails: cleaner_details[0]
            });
        });
    });
});

//Cleaner Requests Page route
router.get('/cleaner_requests/:id', (req, res) =>{
    Cleaner.findById(req.params.id, (err, cleaner) =>{
        //console.log(cleaner)
        var query = {cleanerID: cleaner.cleanerID};
        CleanerDetails.find((query), (err, cleaner_details)=>{
            var secondQuery = {selectedcleanerIDs: cleaner.cleanerID};
            console.log(secondQuery);
            Requests.find(secondQuery)
                .sort('-updated')
                .exec((err, request)=>{
                    if(empty(request)){
                        res.render('cleaner/cleaner_requests',{
                            cleaner: cleaner,
                            cleanerDetails: cleaner_details[0],
                            requests: null
                        });
                    }else{
                        console.log(request[0].dateFirstClean);
                        res.render('cleaner/cleaner_requests',{
                            cleaner: cleaner,
                            cleanerDetails: cleaner_details[0],
                            requests: request
                        });
                }
            })
            // Requests.find((secondQuery), (err, request)=>{

            // })

        });
    });
});

//Cleaner Schedule Page route
router.get('/cleaner_calendar/:id', (req, res) =>{
    Cleaner.findById(req.params.id, (err, cleaner) =>{
        //console.log(req.params.id);
        var query = {cleanerID: cleaner.cleanerID};
        CleanerDetails.find((query), (err, cleaner_details)=>{
            query2 = {cleanerID: req.params.id};
            CleaningSchedule
                .find(query2)
                .populate('clientDetails')
                .exec((err, schedule)=>{
                    if(err){
                        console.log(err)
                    }else{
                        // console.log(schedule[0].clientDetails.length);
                        //console.log(Object.keys(schedule));
                        if(empty(schedule)){
                            //console.log('here');
                            res.render('cleaner/cleaner_calendar',{
                                cleaner: cleaner,
                                cleanerDetails: cleaner_details[0],
                                schedules: null
                            });
                        }else
                        {
                            CleaningSchedule.countDocuments((query2), function(err, c) {
                                //console.log('Count is ' + c);
                                var count = c;
                                let newArray = [];

                                //console.log(typeof(count));
                                for(var i=0; i<count; i++){
                                    let newObject = {};
                                    var tempSchedule = schedule[i];
                                    console.log(tempSchedule)
                                    var firstClean = false;
                                    if(empty(tempSchedule.lastClean)){
                                        firstClean = true;
                                    }else{
                                        var lastCleanDate = tempSchedule.lastClean[0].lastCleanDate;
                                        var lastCleanDate = new Date(lastCleanDate);
                                        var lastCleanDate = date.format(lastCleanDate, 'ddd, MMM DD YYYY');
                                        var lastCleanStatus = tempSchedule.lastClean[0].cleanStatus;
                                        var lastPaidStatus = tempSchedule.lastClean[0].paidStatus;
                                        console.log(tempSchedule.lastClean[0].lastCleanDate);
                                    }
                                    var currentCleanDate = tempSchedule.currentClean[0].currentCleanDate;
                                    var currentCleanDate = new Date(currentCleanDate);
                                    var currentCleanDate = date.format(currentCleanDate, 'ddd, MMM DD YYYY');
                                    var nextCleanDate = tempSchedule.currentClean[0].nextCleanDate;
                                    var nextCleanDate = new Date(nextCleanDate);
                                    var nextCleanDate = date.format(nextCleanDate, 'ddd, MMM DD YYYY');
                                    newObject.currentCleanDate = currentCleanDate;
                                    newObject.lastCleanDate = lastCleanDate;

                                    newObject.nextCleanDate = nextCleanDate;
                                    newObject.clientDetails = tempSchedule.clientDetails
                                    newObject.lastCleanStatus = lastCleanStatus;
                                    newObject.lastPaidStatus = lastPaidStatus;
                                    newArray.push(newObject);
                                    //console.log(tempSchedule.clientDetails);
                                }
                                //console.log(newArray[0].lastCleanDate[0].cleanStatus);
                                res.render('cleaner/cleaner_calendar',{
                                    cleaner: cleaner,
                                    firstClean: firstClean,
                                    //clients: newObject.clientDetails,
                                    cleanerDetails: cleaner_details[0],
                                    schedules: newArray,
                                    scheduleID: schedule[0]._id
                                });
                           });
                        }
                    }

            });
        });
    });
});


//Cleaner FAQs Page route
router.get('/cleaner_faq/:id', (req, res) =>{
    Cleaner.findById(req.params.id, (err, cleaner) =>{
        console.log(cleaner)
        var query = {cleanerID: cleaner.cleanerID};
        CleanerDetails.find((query), (err, cleaner_details)=>{
            //console.log(cleaner_details[0].fullName);
            res.render('cleaner/cleaner_faq',{
                cleaner: cleaner,
                cleanerDetails: cleaner_details[0]
            });
        });
    });
});

module.exports = router;
