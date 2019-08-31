import mongoose from 'mongoose';
import { Router } from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import date from 'date-and-time';

// destructuring the validate token method
import { validateToken } from '../../utils';
import config from '../../config'
import sendEmail from '../../util/email';

// importing the models
import Cleaner from '../../model/cleaner/cleaner';
import CleanerDetails from '../../model/cleaner/cleanerDetails';
import ClientDetails from '../../model/client/clientDetails';
import Requests from '../../model/booking/requests';
import CleaningSchedule from '../../model/cleaningSchedule';
import CleanerWallet from '../../model/cleaner/cleanerWallet'



export default ({config, db}) => {
    let api = Router();

    // ******************************************
    // ******* CLEANER AUTHENTICATION ***********
    // ******************************************

    // '/api/v1/account/cleaner/signup'
    api.post('/signup', (req, res)=>{
        // console.log('submitted');
        // Set The Storage Engine
        const storage = multer.diskStorage({
            destination: './public/uploads/',
            filename: function(req, file, cb){
              cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
          });

          function checkFileType(files, cb){
            // Allowed ext
            const filetypes = /jpeg|jpg|png|gif|pdf/;
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
        }).fields([{name: 'profilePic'}, {name: 'nationalID'}, {name: 'healthInsurance'}])

        upload(req, res, (err) => {
            if(err){
                let result = {};
                let status = 400;
                result.status = status;
                result.error = err;
                res.status(status).send(result);
                // console.log(err);
            } else{
                // const username = req.body.username.toLowerCase();
                const email = req.body.email;
                const password = req.body.password;
                const password2 = req.body.password2;

                const postcode = req.body.postcode;
                const extraTasks = req.body.extraTasks;
                const experience = req.body.experience;
                const profile = req.body.profile;
                const fullName = req.body.fullname;
                const mobileNumber = req.body.mobilenumber;
                const address = req.body.address;
                const city = req.body.city;
                const country = req.body.country;
                const income = req.body.income;
                let cleanerID = bcrypt.hashSync('fullName', 10);
                const profilePic = req.files['profilePic'][0].filename;
                const nationalID = req.files['nationalID'][0].filename;
                const healthInsurance = req.files['healthInsurance'][0].filename;
                //const cleanerID = req.body._id;

                req.checkBody('email', 'Email is required').notEmpty();
                req.checkBody('email', 'Email is not valid').isEmail();
                req.checkBody('password', 'Password is required').notEmpty();
                req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
                req.checkBody('postcode', 'Postcode is required').notEmpty();
                req.checkBody('fullname', 'Your Full Name  is not valid').notEmpty();
                req.checkBody('mobilenumber', 'Mobile Number is required').notEmpty();
                req.checkBody('address', 'Addresss is required').notEmpty();
                req.checkBody('city', 'City is required').notEmpty();
                req.checkBody('country', 'Country is required').notEmpty();
                req.checkBody('income', 'Your desired income is required').notEmpty();
                req.checkBody('experience', 'Your years of experience is required').notEmpty();
                req.checkBody('profile', 'Your profile is required').notEmpty();
                // req.checkBody('nationalID', 'Your means of identification is required').notEmpty();
                // req.checkBody('healthInsurance', 'Your Health Insurance is required').notEmpty();

                let errors = req.validationErrors();

                let status = 200;
                let result = {};

                if (errors) {
                    status = 400;
                    result.error  = errors;
                    result.status = status;
                    res.status(status).send(result);
                }
                else{
                    let newUser = new Cleaner({
                        email:email,
                        cleanerID: cleanerID,
                        password:password
                    });
                    let newUserDetails = new CleanerDetails({
                        postcode: postcode,
                        mobileNumber: mobileNumber,
                        extraTasks: extraTasks,
                        experience: experience,
                        profile: profile,
                        profilePic: profilePic,
                        nationalID: nationalID,
                        healthInsurance: healthInsurance,
                        address: address,
                        fullName: fullName,
                        city: city,
                        country: country,
                        income: income,
                        cleanerID: cleanerID,
                    });
                    let newCleanerWallet = new CleanerWallet({
                        cleanerID: cleanerID,
                        cleanerIncome: income
                    })
                    bcrypt.genSalt(10, (err, salt)=>{
                        bcrypt.hash(newUser.password, salt, (err, hash)=>{
                            if(err){
                              statusCode = 500;
                              let error = err;
                              result.status = status;
                              result.error = error;
                              res.status(statusCode).send(result);
                                console.log(err);
                            }
                            //console.log('bcrypt stage reached');
                            newUser.password = hash;
                            newUser.save((err)=>{

                                let result = {};
                                let status = 200;
                                if (err) {
                                    status = 400;
                                    result.status = status;
                                    result.error = err;
                                    res.status(status).send(result);
                                } else {
                                  newUserDetails.save((err) =>{
                                      let result = {};
                                      let status = 200;
                                      if(err){
                                          status = 400;
                                          result.status = status;
                                          result.error = err;
                                          res.status(status).send(result);
                                      }else {
                                          newCleanerWallet.save((err)=>{
                                              let result = {};
                                              let status = 200;
                                              if(err){
                                                  status = 400;
                                                  result.status = status;
                                                  result.error = err;
                                                  res.status(status).send(result);
                                              }else{
                                                  result.status = status;
                                                  result.message = 'Successfully Created A Cleaner Account & Uploaded pictures';
                                                  res.status(status).send(result);
                                              }
                                          });
                                      }
                                  });
                                }


                            })
                        });
                    });

                }
                // console.log('upload successful');
            }
          });
        // console.log('form submitted');
    });

    // api.post('/signup',  (req, res)=>{
    //     // Setting the  Storage engine

    //     const storage = multer.diskStorage({
    //         destination: './public/uploads/',
    //         filename: (req, file, cb) => {
    //             cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    //         }
    //     });

    //     const checkFileType = (files, cb) => {

    //         // allowed file extensions
    //         const fileTypes = /jpeg|jpg|png|gif|pdf/;

    //         // checking file extensions
    //         const extname = fileTypes.test(path.extname(files.originalname).toLocaleLowerCase());

    //         // checking mime
    //         const mimeType = fileTypes.test(files.mimeType);

    //         if(mimeType && extname) {
    //             return cb(null, true);
    //         } else {
    //             cb('Error: Images and Documents only')
    //         }
    //     }

    //     // Initialise Upload
    //     const upload = multer({
    //         storage: storage,
    //         limits: {fileSize: 10000000},
    //         fileFilter: (req, file, cb) =>{
    //             checkFileType(file, cb);
    //         }
    //     }).fields([{name: 'profilePic'}, {name: 'nationalId'}, {name: 'healthInsurance'}])

    //     // TODO: check if this code is running well because of the (err) part
    //     upload(req, res, (err)=>{
    //         if (err) {
    //             let result = {};
    //             let status = 400;
    //             result.status = status;
    //             result.error = err;
    //             res.status(status).send(result);
    //             console.log(err);

    //         } else {
    //             const {email, password, password2, postcode, extraTasks, experience, profile, fullName, mobileNumber, address, city, income } = req.body;
    //             const cleanerId = bcrypt.hashSync('fullName', 10);
    //             const profilePic = req.files['profilePic'][0].filename;
    //             const nationalId = req.files['nationalId'][0].filename;
    //             const healthInsurance = req.files['healthInsurance'][0].filename;

    //             req.checkBody('email', 'Email is required').notEmpty();
    //             req.checkBody('email', 'Email is not valid').isEmail();
    //             req.checkBody('password', 'Password is required').notEmpty();
    //             req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    //             req.checkBody('postcode', 'Postcode is required').notEmpty();
    //             req.checkBody('fullName', 'Full Name is required').notEmpty();
    //             req.checkBody('mobileNumber', 'Mobile Number is required').notEmpty();
    //             req.checkBody('address', 'Address is required').notEmpty();
    //             req.checkBody('city', 'City is required').notEmpty();
    //             req.checkBody('income', 'Your desired income is required').notEmpty();
    //             req.checkBody('experience', 'Your years of experience is required').notEmpty();
    //             req.checkBody('profile', 'Your profile is required').notEmpty();

    //             let errors = req.validationErrors();
    //             let status = 200;
    //             let result = {};

    //             if (errors) {
    //                 status = 400;
    //                 result.error  = errors;
    //                 result.status = status;
    //                 res.status(status).send(result);
    //             } else {
    //                 let newUser =  new Cleaner({
    //                     email: email,
    //                     cleanerId: cleanerId,
    //                     password: password
    //                 });

    //                 let newCleanerDetails = new CleanerDetails ({
    //                     postcode: postcode,
    //                     mobileNumber: mobileNumber,
    //                     extraTasks: extraTasks,
    //                     experience: experience,
    //                     profile: profile,
    //                     profilePic: profilePic,
    //                     nationalId: nationalId,
    //                     healthInsurance: healthInsurance,
    //                     address: address,
    //                     fullName: fullName,
    //                     city: city,
    //                     income: income,
    //                     cleanerId: cleanerId
    //                 });

    //                 Cleaner.createUser(newUser, (err, user)=>{
    //                     // let result = {};
    //                     // let status = 200;
    //                     if (err) {
    //                         status = 400;
    //                         result.status = status;
    //                         result.error = err;
    //                         res.status(status).send(result);
    //                     }
    //                     result.status = status;
    //                     result.message = 'Successfullt created a new Cleaner Account';
    //                     res.status(status).send(result);
    //                 });

    //                 newCleanerDetails.save( err =>{
    //                     if (err) {
    //                         status = 400;
    //                         result.status = status;
    //                         result.error = err;
    //                         res.send(status).send(result)
    //                     }

    //                 });
    //             }
    //             res.json({'message': 'Upload Successfull'})
    //         }
    //     })
    // });


    // '/api/v1/account/cleaner/login'
    api.post('/login', (req, res)=>{
        let result  = {};
        let status  = 200;

        const {email, password}  = req.body;
        Cleaner.findOne({email}, (err, user)=>{
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
                let  message = 'Incorrect email or password';
                result.status = status;
                result.error = err;
                result.message = message;
                res.status(status).send(result);
            }
        })
    });


    // '/api/v1/account/cleaner/passwordUpdate/:id'
    api.patch('/passwordUpdate/:id', validateToken, (req, res) => {
        // get user from collection
        Cleaner.findById(req.id, (err, user) => {
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


    // '/api/v1/account/cleaner/forgotPassword'
    api.post('/forgotPassword', validateToken,  (req,res) =>{
        // get user baed on posted email
        Cleaner.findOne({email: req.body.email}, (err, user) =>{
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
    });

    // '/api/v1/account/cleaner/resetPassword/:token'
    api.patch('/resetPassword/:token', (req, res)=>{
        // get user based on the token
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        // const user =
         Cleaner.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()} }, (err, user) => {
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

    // '/api/v1/account/cleaner/logout'
    api.get('/logout', (req, res)=>{
        req.logout();
        let result = {};
        let status = 201;
        result.status = status;
        result.message = 'Successfully logged out';
        res.status(status).send(result);
    });

    // ********************************************
    // ******* CLEANER PROFILE SETTINGS ***********
    // ********************************************

    // '/api/v1/account/cleaner/profile/:cleanerID/:id'
    api.post('/profile/:cleanerID/:id/', validateToken, (req, res) =>{
        let statusCode  = 200;
        let result = {};

        let cleaner = {};
        cleaner.fullName = req.body.fullName;
        //console.log(req.body.fullName);
        cleaner.postcode = req.body.postcode;
        cleaner.city = req.body.city;
        cleaner.country = req.body.country;
        cleaner.address = req.body.address;
        cleaner.mobileNumber = req.body.mobileNumber;
        cleaner.extraTasks = req.body.extraTasks;
        cleaner.profile = req.body.profile;
        cleaner.income = req.body.income;
        let query = {cleanerID : req.params.cleanerID}
        //console.log(query);
        //console.log(req.params.cleanerID)

        CleanerDetails.updateOne(query, cleaner, (err) =>{
            if(err){
                result.statusCode = 401;
                result.error = err;
                res.status(statusCode).send(result);

            }else {
                result.statusCode = statusCode;
                result.message = 'found and updated';
                res.status(statusCode).send(result);

                // console.log('found and updated');
                // req.flash('success', 'Account Updated');
                // res.redirect('/cleaner/dashboard/home/'+req.params.id);
            }
        });
    });



    // **************************************
    // ******* CLEANER DASHBOARD  ***********
    // **************************************

    // '/api/v1/account/cleaner/home/:id'
    api.get('/home/:id', (req, res) =>{
        Cleaner.findById(req.params.id, (err, cleaner) =>{
            //console.log(cleaner)
            var query = {cleanerID: cleaner.cleanerID};
            CleanerDetails.find((query), (err, cleaner_details)=>{
                //console.log(cleaner_details[0].fullName);
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
        Cleaner.findById(req.params.id, (err, cleaner) =>{
            //console.log(cleaner)
            let result = {};
            let statusCode = 200;
            var query = {cleanerID: cleaner.cleanerID};
            CleanerDetails.find((query), (err, cleaner_details)=>{
                //console.log(cleaner_details);
                Wallet.findOne((query), (err, wallet)=>{
                    // console.log(cleaner.cleanerID);
                    // console.log(wallet);

                    if (err) {
                        result.statusCode = 404;
                        result.error = err;
                        res.status(statusCode).send(result);
                    }
                    result.statusCode = statusCode;
                    result.userDetails = cleaner_details[0];
                    result.wallet = wallet;
                    res.status(statusCode).send(result);
                })
            });
        });
    });

    api.get('/cleanerInvoice/:id', (req, res) =>{
        Cleaner.findById(req.params.id, (err, cleaner) =>{
            let result = {};
            let statusCode = 201;
            console.log(cleaner)
            var query = {cleanerID: cleaner.cleanerID};
            CleanerDetails.find((query), (err, cleaner_details)=>{
                if (err) {
                    result.statusCode = 404;
                    result.error = err;
                    res.status(statusCode).send(result);
                }
                result.statusCode = statusCode;
                result.user = cleaner_details[0] ;
                res.status(statusCode).send(result);
            });
        });
    });


    api.get('/cleanerRequests/:id', (req, res) =>{
            let result = {};
            let statusCode = 201;
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
                            result.statusCode = statusCode;
                            result.user = cleaner ;
                            result.requests = null;
                            result.userDetails = cleaner_details[0] ;
                            res.status(statusCode).send(result);
                        }else{

                            result.statusCode = statusCode;
                            result.user = cleaner ;
                            result.requests = request;
                            result.userDetails = cleaner_details[0] ;
                            res.status(statusCode).send(result);

                    }
                })
                // Requests.find((secondQuery), (err, request)=>{

                // })

            });
        });
    });

    api.get('/cleanerCalendar/:id', (req, res) =>{
        Cleaner.findById(req.params.id, (err, cleaner) =>{
            //console.log(req.params.id);
            let result =  {};
            let statusCode = 200;
            var query = {cleanerID: cleaner.cleanerID};
            CleanerDetails.find((query), (err, cleaner_details)=>{
                query2 = {cleanerID: req.params.id};
                CleaningSchedule
                    .find(query2)
                    .populate('clientDetails')
                    .exec((err, schedule)=>{
                        if(err){
                            statusCode = 400;
                            result.statusCode = statusCode;
                            result.error = err;
                            res.status(statusCode).send(result);
                        }else{
                            // console.log(schedule[0].clientDetails.length);
                            //console.log(Object.keys(schedule));
                            if(empty(schedule)){
                                //console.log('here');
                                result.statusCode = 400;
                                result.user = cleaner ;
                                result.userDetails = cleaner_details[0] ;
                                result.schedules = null;
                                res.status(statusCode).send(result);

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
                                    // res.render('cleaner/cleaner_calendar',{
                                    //     cleaner: cleaner,
                                    //     firstClean: firstClean,
                                    //     //clients: newObject.clientDetails,
                                    //     cleanerDetails: cleaner_details[0],
                                    //     schedules: newArray,
                                    //     scheduleID: schedule[0]._id
                                    // });z

                                    result.statusCode = statusCode;
                                    result.user = cleaner ;
                                    result.firstClean = firstClean;
                                    result.userDetails = cleaner_details[0] ;
                                    result.schedules = newArray;
                                    result.scheduleID = schedule[0]._id;
                                    res.status(statusCode).send(result);
                               });
                            }
                        }

                });
            });
        });
    });

    api.get('/cleanerFaq/:id', (req, res) =>{
        Cleaner.findById(req.params.id, (err, cleaner) =>{
            console.log(cleaner)
            var query = {cleanerID: cleaner.cleanerID};
            CleanerDetails.find((query), (err, cleaner_details)=>{
                //console.log(cleaner_details[0].fullName);
                let result = {};
                let statusCode = 200;
                if (err) {
                    statusCode = 400;
                    result.statusCode = statusCode;
                    result.error = err;
                    res.status(statusCode).send(result);
                }
                    result.user = cleaner;
                    result.userDetails = cleaner_details[0];
                    result.statusCode = statusCode;

                    res.status(statusCode).send(result);
            });
        });
    });

    return api;
}

// api.get('/dashboard/:id', (req, res) =>{
//     Client.findById(req.params.id, (err, client) =>{
//         //console.log(client)
//         var query = {clientID: client.clientID};
//         ClientDetails.find((query), (err, client_details)=>{
//             let result = {};
//             let status = 201;

//             if (err) {
//                 result.status = 404;
//                 result.error = err;
//                 res.status(status).send(result);
//             }
//             result.status = status;
//             result.user = client_details[0] ;
//             res.status(status).send(result);
//         });
//     });
// });
