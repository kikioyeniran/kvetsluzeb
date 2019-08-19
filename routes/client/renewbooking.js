const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var empty = require('is-empty');
const multer = require('multer');
const path = require('path');

//Bring in Client Models
let ClientDetails =  require('../../models/clientDetails');

//Renew Client Booking
router.post('/:clientID/:id', (req, res) =>{
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
        if(err){
            console.log(err);
            return;
        }else {
            console.log('found and updated');
            req.flash('success', 'Account Updated');
            res.redirect('/client/dashboard/home/'+req.params.id);
        }
    });
});
 
module.exports = router;
