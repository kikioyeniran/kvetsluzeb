const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

//Bring in Client Models
let Client =  require('../../models/client');
let ClientDetails =  require('../../models/clientDetails');
let ClientWallet =  require('../../models/clientWallet');

//Bookings route
router.get('', (req, res) =>{
    res.render('booking')
});

//Booking and Sign up Processes
router.post('', (req, res)=>{
    console.log('form submitted');

    const storage = multer.diskStorage({
        destination: './public/uploads/',
        filename: function(req, file, cb){
          cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
      });

      function checkFileType(files, cb){
        // Allowed ext
        const filetypes = /jpeg|jpg|png|gif/;
        // Check ext
        const extname = filetypes.test(path.extname(files.originalname).toLowerCase());
        // Check mime
        const mimetype = filetypes.test(files.mimetype);

        if(mimetype && extname){
          return cb(null,true);
        } else {
          cb('Error: Images and Documents Only!');
        }
      }
    // Initialise Upload
    const upload = multer({
    storage: storage,
    limits:{fileSize: 10000000},
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
    }).single('profilePic')


    upload(req, res, (err) => {
        if(err){
            console.log(err);
        }else{
            // const username = req.body.username.toLowerCase();
            const email = req.body.email.toLowerCase();
            const password = req.body.password;
            const password2 = req.body.password2;

            const postcode = req.body.postcode;
            const bedrooms = req.body.bedrooms;
            const bathrooms = req.body.bathrooms;
            const extraTasks = req.body.extraTasks;
            const hours  = req.body.hours;
            const more_hours  = req.body.more_hours;
            const priority = req.body.priority;
            const access_type = req.body.access_type;
            const keySafePin = req.body.keySafePin;
            const keyHiddenPin = req.body.keyHiddenPin;
            const schedule = req.body.schedule;
            const date = req.body.date;
            const fullName = req.body.fullname;
            const mobileNumber = req.body.mobilenumber;
            const address = req.body.address;
            const city = req.body.city;
            const country = req.body.country;
            const profilePic = req.file.filename;
            let clientID = bcrypt.hashSync('fullName', 10);
            console.log(clientID);

            req.checkBody('email', 'Email is required').notEmpty();
            req.checkBody('email', 'Email is not valid').isEmail();
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
                req.checkBody('keySafePin', 'Key Safe Pin is required').notEmpty();
            }
            if(access_type == 'key_hidden'){
                req.checkBody('keyHiddenPin', 'Key Hidden location is required').notEmpty();
            }
            req.checkBody('schedule', 'Schedule is required').notEmpty();
            req.checkBody('fullname', 'Your Full Name  is not valid').notEmpty();
            req.checkBody('mobilenumber', 'Mobile Number is required').notEmpty();
            req.checkBody('address', 'Addresss is required').notEmpty();
            req.checkBody('city', 'City is required').notEmpty();
            req.checkBody('country', 'Country is required').notEmpty();

            let errors = req.validationErrors();
            if(errors){
                res.render('booking', {
                    errors:errors
                });
            }
            else{
                let newUser = new Client({
                    email:email,
                    password:password,
                    clientID: clientID
                });
                 let newUserDetails = new ClientDetails({
                    postcode: postcode,
                    bedrooms: bedrooms,
                    bathrooms: bathrooms,
                    extraTasks: extraTasks,
                    dateFirstClean: date,
                    cleaningHours: hours,
                    moreCleaningHours: more_hours,
                    cleaningPriority: priority,
                    apartmentAccess: access_type,
                    keyHiddenPin: keyHiddenPin,
                    keySafePin: keySafePin,
                    cleaningFrequency:schedule,
                    mobileNumber: mobileNumber,
                    address: address,
                    fullName: fullName,
                    city: city,
                    country: country,
                    profilePic: profilePic,
                    clientID: clientID
                });
                let newWallet = new ClientWallet({
                    clientID: clientID
                })

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
                    }else{
                        newWallet.save((err)=>{
                            if(err){
                                console.log(err);
                                return;
                            }else {
                                console.log('done adding details');
                                req.flash('success', 'Client added')
                                res.redirect('/client/booking_final/'+encodeURIComponent(clientID));
                            }
                        })
                    }
                });
            }
        }
    })
});



module.exports = router;
