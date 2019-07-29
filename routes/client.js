const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var empty = require('is-empty');

//Bring in Client Models
let Client =  require('../models/client');
let ClientDetails =  require('../models/client_details');
//Cleaner Models
let Cleaner =  require('../models/cleaner');
let CleanerDetails =  require('../models/cleaner_details');

//Bookings route
router.get('/booking', (req, res) =>{
    res.render('booking')
});

//Booking Final route
router.get('/booking_final/:client', (req, res) =>{
    // res.render('booking_final');
    // var ID = req.params.client;
    // console.log(ID);
    //var query1 = {clientID: ID};
    Client.findOne(({clientID: req.params.client}), (err, client) =>{
        console.log(client)
        ClientDetails.findOne(({clientID: req.params.client}), (err, client_details)=>{
            console.log(client_details.city);
            var query2 = {city: client_details.city};
            CleanerDetails.find((query2), (err, cleanerDetails)=>{
                if(empty(cleanerDetails)){
                    console.log('cleaner details empty');
                    res.render('booking_final',{
                        client: client,
                        clientDetails: client_details
                    });
                }else{
                    //console.log(cleanerDetails);
                    res.render('booking_final',{
                        client: client,
                        clientDetails: client_details,
                        cleanerDetails: cleanerDetails
                    });
                }

            });
        });
    });
});

//Client Login route
router.get('/client_login', (req, res) =>{
    res.render('admin/client_login')
});

//Client Dashboard route
router.get('/admin/client_dashboard', (req, res) =>{
    res.render('admin/client_dashboard')
});

router.get('/admin/client_dashboard/:id', (req, res) =>{
    Client.findById(req.params.id, (err, client) =>{
        console.log(client)
        var query = {client_id: client.clientID};
        ClientDetails.find((query), (err, client_details)=>{
            //console.log(cleaner_details[0].full_name);
            res.render('admin/client_dashboard',{
                client: client,
                clientDetails: client_details[0]
            });
        });
    });
});

//Client Finance Page route
router.get('/admin/client_finance', (req, res) =>{
    res.render('admin/client_finance')
});
//Client Finance Page route
router.get('/admin/client_invoice', (req, res) =>{
    res.render('admin/client_invoice')
});
//Client Calendar Page route
router.get('/admin/client_calendar', (req, res) =>{
    res.render('admin/client_calendar')
});
//Client FAQs Page route
router.get('/admin/client_faq', (req, res) =>{
    res.render('admin/client_faq')
});

//Booking and Sign up Processes
router.post('/booking', (req, res)=>{
    console.log('form submitted');
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;

    const postcode = req.body.postcode;
    const bedrooms = req.body.bedrooms;
    const bathrooms = req.body.bathrooms;
    const extra_tasks = req.body.extra_tasks;
    const hours  = req.body.hours;
    const more_hours  = req.body.more_hours;
    const priority = req.body.priority;
    const access_type = req.body.access_type;
    const key_safe_pin = req.body.key_safe_pin;
    const key_hidden_pin = req.body.key_hidden_pin;
    const schedule = req.body.schedule;
    const date = req.body.date;
    const fullName = req.body.fullname;
    const mobileNumber = req.body.mobilenumber;
    const address = req.body.address;
    const city = req.body.city;
    let clientID = bcrypt.hashSync('fullName', 10);

    console.log(clientID);

    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);


    req.checkBody('postcode', 'Postcode is required').notEmpty();
    req.checkBody('bedrooms', 'Number of Bedrooms is required').notEmpty();
    req.checkBody('bedrooms', 'Number of bedrooms must be a number').isNumeric();
    req.checkBody('bathrooms', 'Number of bathrooms is required').notEmpty();
    req.checkBody('bathrooms', 'Number of bathrooms mnust be a number').isNumeric();
    req.checkBody('hours', 'Hours for cleaning is required').notEmpty();
    if(more_hours == 'more'){
        req.checkBody('more_hours', 'Extended Cleaning Hours is required').notEmpty();
    }
    req.checkBody('access_type', 'How cleaner would access your home cannot be empty').notEmpty();
    if(access_type == 'key_safe'){
        req.checkBody('key_safe_pin', 'Key Safe Pin is required').notEmpty();
    }
    if(access_type == 'key_hidden'){
        req.checkBody('key_hidden_pin', 'Key Hidden location is required').notEmpty();
    }
    req.checkBody('schedule', 'Schedule is required').notEmpty();
    req.checkBody('fullname', 'Your Full Name  is not valid').notEmpty();
    req.checkBody('mobilenumber', 'Mobile Number is required').notEmpty();
    req.checkBody('address', 'Addresss is required').notEmpty();
    req.checkBody('city', 'City is required').notEmpty();

    let errors = req.validationErrors();

    if(errors){
        res.render('booking', {
            errors:errors
        });
    }
    else{
        let newUser = new Client({
            email:email,
            username:username,
            password:password,
            clientID: clientID
        });
         let newUserDetails = new ClientDetails({
            postcode: postcode,
            bedrooms: bedrooms,
            bathrooms: bathrooms,
            extra_tasks: extra_tasks,
            date_first_clean: date,
            cleaning_hours: hours,
            more_cleaning_hours: more_hours,
            cleaning_priority: priority,
            apartment_access: access_type,
            key_hidden_pin: key_hidden_pin,
            key_safe_pin: key_safe_pin,
            cleaning_frequency:schedule,
            mobile_number: mobileNumber,
            address: address,
            full_name: fullName,
            city: city,
            clientID: clientID
        });

        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(newUser.password, salt, (err, hash)=>{
                if(err){
                    console.log(err);
                }
                //console.log('bcrypt stage reached');
                newUser.password = hash;
                newUser.save((err)=>{
                    if(err){
                        console.log(err);
                        return;
                    }else{
                        req.flash('success', 'You are now registered and can login');
                        console.log('new user save function worked');
                        //console.log(req.user.id);
                        // res.redirect('/');
                    }
                })
            });
        });
        newUserDetails.save((err) =>{
            if(err){
                console.log(err);
                return;
            }else {
                console.log('done adding details');
                req.flash('success', 'Client added')
                res.redirect('/client/booking_final/'+clientID);
            }
        });
    }
});

//Login  Form Page route
router.get('/login', (req, res)=>{
    res.render('login');
});

router.post('/client_login',
  passport.authenticate('client', { failureRedirect: '/client/client_login', failureFlash: true  }),
  function(req, res) {
    res.redirect('/client/admin/client_dashboard/'+req.user.id);
  });

//Logout
router.get('/admin/client_logout', (req, res)=>{
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/client/client_login')
});
module.exports = router;