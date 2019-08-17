import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import crypto from 'crypto';

import { validateToken } from '../../utils';

import config from '../../config';
const sendEmail  = require('../../util/email');

import Client from '../../model/client/client';
import ClientDetails from '../../model/client/clientDetails';

import Cleaner from '../../model/cleaner/cleaner';
import CleanerDetails from '../../model/cleaner/cleanerDetails';

export default ({config, db}) => {
    let api = Router();

    // **************************************************************
    // ******* CLIENT AUTHENTICATION COUPLED WITH BOOKING ***********
    // **************************************************************

    // /api/v1/clent/account/signup -- Booking and signup process
    // api.post('/signup', (req, res)=>{
    //     const { username, email, password, password2 } = req.body;
    //     const { postcode, bedrooms, bathrooms, extraTasks, hours, moreHours, priority, accessType, keySafePin, keyHiddenPin, schedule, dateOfFirstClean, fullName, mobileNumber, address, city } = req.body;

    //     let clientID = bcrypt.hashSync('fullName', 10);

    //     req.checkBody('email', 'Email is required').notEmpty();
    //     req.checkBody('email', 'Email is not valid').isEmail();
    //     req.checkBody('username', 'Username is required').notEmpty();
    //     req.checkBody('password', 'Password is required').notEmpty();
    //     req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    //     req.checkBody('postcode', 'Postcode is required').notEmpty();
    //     req.checkBody('bedrooms', 'Number of Bedrooms is required').notEmpty();
    //     req.checkBody('bedrooms', 'Bedroom field must be a number').isNumeric();
    //     req.checkBody('bathrooms', 'Number of Bathrooms is required').notEmpty();
    //     req.checkBody('bathrooms', 'Bathroom field must be a number').isNumeric();
    //     req.checkBody('hours', 'Hours for cleaning is required').notEmpty();
    //     req.checkBody('hours', 'Hours field must be a number').isNumeric();
    //     if(moreHours === 'more'){
    //         req.checkBody('moreHours', 'Extend cleaning hours is required').notEmpty();
    //     }
    //     req.checkBody('accessType', 'Access Type field is required').notEmpty();
    //     if (accessType === 'keySafe') {
    //         req.checkBody('keySafePin', 'keySafePin field is required').notEmpty();
    //     }
    //     if (accessType === 'keyHidden') {
    //         req.checkBody('KeyHiddenPin', 'KeyHiddenPin field is required').notEmpty();
    //     }

    //     req.checkBody('schedule', 'Schedule field is required').notEmpty();
    //     req.checkBody('fullName', 'FullName field is required').notEmpty();
    //     req.checkBody('mobileNumber', 'Mobile Number field is required').notEmpty();
    //     req.checkBody('address', 'Addresss field is required').notEmpty();
    //     req.checkBody('city', 'City field is required').notEmpty();

    //     let errors = req.validationErrors();

    //     if(errors) {
    //         let status = 400;
    //         let result = {};
    //         let error = errors;
    //         result.status = status;
    //         result.error = error;
    //         res.status(status).send(result);
    //     } else {
    //         let newClient = new Client({
    //             email: email,
    //             username: username,
    //             password: password,
    //             clientID: clientID
    //         });
    //         let newClientDetails = new ClientDetails({
    //             postcode: postcode,
    //             bedrooms: bedrooms,
    //             bathrooms: bathrooms,
    //             extraTasks: extraTasks,
    //             dateOfFirstClean: dateOfFirstClean,
    //             cleaningHours: hours,
    //             moreCleaningHours: moreHours,
    //             cleaningPriority: priority,
    //             apartmentAccessType: accessType,
    //             keyHiddenPin: keyHiddenPin,
    //             keySafePin: keySafePin,
    //             cleaningFrequency: schedule,
    //             mobileNumber: mobileNumber,
    //             address: address,
    //             fullName: fullName,
    //             city: city,
    //             clientID: clientID
    //         });

    //         Client.createUser(newClient, (err, user)=>{
    //             // let result = {};
    //             // let status = 200;
    //             if (err) {
    //                 status = 400;
    //                 result.status = status;
    //                 result.error = err;
    //                 res.status(status).send(result);
    //             }
    //             result.status = status;
    //             result.message = 'Successfullt created a new Client Account';
    //             res.status(status).send(result);
    //         });

    //         newClientDetails.save(err=>{
    //             if (err) {
    //                 let result = {};
    //                 let status = 400;
    //                 let error = err;
    //                 result.status = status;
    //                 result.error = error;
    //                 res.status(status).send(result)
    //             } 
    //             const emailMessage = '';
    //             const sendEmail = ({
    //                 email: user.email,
    //                 subject: 'Welcome to Kvet sluzeb',
    //                 message: emailMessage
    //             });
    //             // res.status(200).json({
    //             //     status: 'success',
    //             //     message: 'Token sent to mail'
    //             // })
    //             let result = {};
    //             let status = 201;
    //             let message = 'Done adding details';
    //             result.status = status;
    //             result.message = message;
    //             res.status(status).send(result);
    //     })
    //     }
    // });

    //Booking and Sign up Processes
    api.post('/signup', (req, res)=>{
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

            let statusCode = 200;
            let result = {};

        upload(req, res, (err) => {
            
            if(err){
                statusCode = 500;
                let error = err;
                result.status = status;
                result.error = error;
                res.status(statusCode).send(result);
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

                    statusCode = 500;
                    let error = errors;
                    result.status = status;
                    result.error = error;
                    res.status(statusCode).send(result);
                    
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
                                statusCode = 500;
                                let error = err;
                                result.status = status;
                                result.error = error;
                                res.status(statusCode).send(result);
                                // console.log(err);
                            }
                            //console.log('bcrypt stage reached');
                            newUser.password = hash;
                            newUser.save((err)=>{
                                if(err){
                                    statusCode = 500;
                                    let error = err;
                                    result.status = status;
                                    result.error = error;
                                    res.status(statusCode).send(result);
                                }else{

                                    const sendEmail = ({
                                        email: user.email,
                                        subject: 'Welcome to Kvet sluzeb',
                                        message: emailMessage
                                    })
                                    result.statusCode = statusCode;
                                    result.message = 'You are now registered and can login';
                                    res.status(statusCode).send(result);
                                    
                                    //console.log(req.user.id);
                                    // res.redirect('/');
                                }
                            })
                        });
                    });
                    newUserDetails.save((err) =>{
                        if(err){
                            statusCode = 500;
                            let error = err;
                            result.status = status;
                            result.error = error;
                            res.status(statusCode).send(result);
                        }else{
                            newWallet.save((err)=>{
                                if(err){
                                    statusCode = 500;
                                    let error = err;
                                    result.status = status;
                                    result.error = error;
                                    res.status(statusCode).send(result);
                                }else {
                                    statusCode = 200;
                                    result.status = status;
                                    result.error = 'Client added';
                                    result.userID = clientID
                                    res.status(statusCode).send(result);                                    
                                }
                            })
                        }
                    });
                }
            }
        })
    });

    
    // '/api/v1/client/account/login'    
    api.post('/login', (req, res)=>{
        let result  = {};
        let status  = 200;

        const {email, password}  = req.body;
        Client.findOne({email}, (err, user)=>{
            if(!err && user) {
                // if there is no error and a user is found 
                bcrypt.compare(password, user.password).then(match => {
                    if (match) {
                        status = 200;

                        // creating the user token
                        // const payload = { user: user.name};
                        const payload = { _id:  user._id}

                        const options = {expiresIn: '1d', issuer: 'http://relicinnova.com.ng'};
                        const secret = config.secret;
                        const token = jwt.sign(payload, secret, options);

                        // printing the token 
                        result.token = token;
                        result.user = user;
                        result.status = status;

                        res.status(status).send(result);
                    } else {
                        status = 400;
                        result = error = 'Authentication error';
                        res.status(status).send(result);
                    }
                }).catch( err=> {
                    status = 500;
                    result.status = status;
                    result.error = err;
                    res.status(status).send(result);
                });
            } else {
                status = 400;
                message = 'Incorrect email or password';
                result.status = status;
                result.error = err;
                result.message = message;
                res.status(status).send(result);
            }
        })
    });

    api.post('/forgotPassword', validateToken, (req,res) =>{
        // get user baed on posted email
        Client.findOne({email: req.body.email}, (err, user) =>{
            if (err) {
                res.status(404).send(err);
            }
            // generate random token 
            const resetToken = user.createPasswordResetToken();
            // await user.save()
            user.save({validateBeforeSave: false})

            const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/client/account/resetPassword/${resetToken}`
            const message = `Forgot Password? Submit a PATCH request with your new Password and passwordConfirn to: ${resetUrl}.\n IF you didnt forget your password, please ignore this email!`
            try {
                const sendEmail = ({
                    email: user.email,
                    subject: 'Password Reset Link (Valid for 10Mins)',
                    message: message
                })
                res.status(200).json({
                    status: 'success',
                    message: 'Token sent to mail'
                })
            } catch(err) {
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;

                user.save({validateBeforeSave: false})

                console.log(err);
            }                                    
        }) 
        // send it to user email
    })

    api.patch('/resetPassword/:token',  (req, res)=>{

        // get user based on the token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

        // const user =
         Client.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()} }, (err, user) => {
             if(err) {
                 res.status(404).send(err);
             }

             user.password = req.body.password
             user.password2 = req.body.password2
             user.passwordResetToken = undefined;
             user.passwordResetExpires = undefined;

             user.save(err => {
                 if(err) {
                     res.status(200).send(err);
                 }
                 res.status(201).json({
                     message: 'Successful'
                 })
             })
            //  Redirect the user to login
         });
        // if token has not expired and user exists we set the new password        
    })
    
    api.patch('/passwordUpdate/:id', validateToken, (req, res) => {
        // get user from collection
        Client.findById(req.id, (err, user) => {
            if (err) {
                res.send(err);
            } else if(!(user.correctPassword(req.body.passwordCurrent, user.password))) {
                res.status(404).send('Your current password is wrong.')
            }
        })
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;

        user.save(err => {
            if (err) {
                res.status(404).send(err);
            } 
            res.status(201).json({
                message: 'Successfull'
            })
        })        
    })
    

    // '/api/v1/client/account/logout'    
    api.get('/logout', (req, res)=>{
        req.logout();
        let result = {};
        let status = 201;
        let message = 'Successfully Logged out';
        result.status = status;
        result.message = message;
        res.status(status).send(result);
    });


    // ********************************************
    // ******* CLEANER PROFILE SETTINGS ***********
    // ********************************************

    api.post('/profile/:clientID/:id', validateToken, (req, res) =>{
        let statusCode  = 200;
        let result = {};

        let client = {};
        client.fullName = req.body.fullName;
        console.log(req.body.fullName);
        client.postcode = req.body.postcode;
        client.city = req.body.city;
        client.country = req.body.country;
        client.address = req.body.address;
        client.mobileNumber = req.body.mobileNumber;
        let query = {clientID : req.params.clientID}
        console.log(query);
        console.log(req.params.clientID)
    
        ClientDetails.updateOne(query, client, (err) =>{
            if(err){
                result.statusCode = 401;
                result.error = err;
                res.status(statusCode).send(result);
            }else {
                result.statusCode = statusCode;
                result.message = 'found and updated';
                res.status(statusCode).send(result);
                // res.redirect('/client/dashboard/home/'+req.params.id);
            }
        });
    });

     // ************************************
    // ******* CLIENT DARSHBOARD ***********
    // *************************************


    api.get('/home/:id', (req, res) =>{
        Client.findById(req.params.id, (err, client) =>{
            //console.log(client)
            var query = {clientID: client.clientID};
            ClientDetails.find((query), (err, client_details)=>{
                let result = {};
                let statusCode = 201;
                
                if (err) {
                    result.status = 404;
                    result.error = err;
                    res.status(statusCode).send(result);
                }
                result.statusCode = statusCode;
                result.user = cleaner_details[0] ;
                res.status(statusCode).send(result);
            });
        });
    });

    api.get('/wallet/:id', (req, res) =>{
        Client.findById(req.params.id, (err, client) =>{
            //console.log(client)
            let result = {};
            let statusCode = 200;

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
    
                    

                    result.statusCode = statusCode;
                    result.user = client;
                    result.wallet = clientWallet;
                    result.costStatus = costStatus;
                    result.pending = pending;
                    result.stripeKey = 
                    result.userDetails = client_details[0];
                    result.wallet = wallet;
                    result.StripePublishableKey = config.StripePublishableKey;
                    res.status(statusCode).send(result);
                })
            });
        });
    });

    api.get('/transactions/:id', (req, res) =>{
        Client.findById(req.params.id, (err, client) =>{
            //console.log(client)
            let result = {};
            let statusCode = 200;

            var query = {clientID: client.clientID};
            ClientDetails.find((query), (err, client_details)=>{
                //console.log(client_details[0]);
                AllTransactions.find((query), (err, transactions)=>{
                    var noTransaction = false;
                    if(empty(transactions)){
                        noTransaction = true;
                    }

                    result.statusCode = statusCode;
                    result.user = client;
                    result.userDetails = client_details[0];
                    result.transactions = transactions
                    result.transactionStatus = noTransaction;                    
                    res.status(statusCode).send(result);
                    // console.log(transactions[0].cleaner);
                
                })
            });
        });
    });

    api.get('/clientFaq/:id', (req, res) =>{
        Client.findById(req.params.id, (err, client) =>{
            //console.log(client)
            
            var query = {clientID: client.clientID};
            ClientDetails.find((query), (err, client_details)=>{
                //console.log(client_details[0]);
                let result = {};
                let statusCode = 200;
                if (err) {
                    statusCode = 400;
                    result.statusCode = statusCode;
                    result.error = err;
                    res.status(statusCode).send(result);
                }
                    result.user = client;
                    result.userDetails = client_details[0];
                    result.statusCode = statusCode;
                    res.status(statusCode).send(result);
            });
            });
        });
  
       
        api.get('/renew/:id', (req, res) =>{
            Client.findById(req.params.id, (err, client) =>{
                //console.log(client)
                var query = {clientID: client.clientID};
                ClientDetails.find((query), (err, client_details)=>{
                    //console.log(client_details[0]);
                let result = {};
                let statusCode = 200;
                if (err) {
                    statusCode = 400;
                    result.statusCode = statusCode;
                    result.error = err;
                    res.status(statusCode).send(result);
                }
                    result.user = client;
                    result.userDetails = client_details[0];
                    result.statusCode = statusCode;
                    res.status(statusCode).send(result);
                });
            });
        });

    return api;
}