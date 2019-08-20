const express = require('express');
const router = express.Router();
const crypto = require('crypto')
const sendEmail  = require('../email');
const async = require('async');
//Bring in Client Models
let Client =  require('../../models/client');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');


router.get('/forgotpswd', (req, res) =>{
    res.render('client/forgotpswd');
});

//Forgot Password Post Process
router.post('/forgotpswd',  (req,res, next) =>{
    async.waterfall([
        function (done) {
            crypto.randomBytes(20,function(err, buf){
                const token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            Client.findOne({email: req.body.email}, function(err, user) {
                if(!user) {
                    console.log('no user with that email address\n please flash this as a message to the user');
                    return res.redirect('/forgotpswd');
                }
                user.passwordResetToken = token;
                user.passwordResetExpires = Date.now() + 600000;  // 10 mins
                user.save(function(err){
                    done(err, token, user)
                });
            });
        },
        function (token, user, done) {
            const message = {
                to: user.email,
                from: '[no-reply]@kvetslueb.com.ng',
                subject: 'Password Reset (Valid for 10mins)',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/resetpswd/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            sgMail.send(message, (err)=>{
                console.log(`An email has been sent to ${user.email} with futher instructions`);
                done(err, 'done');
            })
        }
    ], (err)=>{
        if(err) return next(err);
        res.redirect('/forgotpswd');
    })
    // get user based on posted email
    // Client.findOne({email: req.body.email}, (err, user) =>{
    //     if (err) {
    //         res.status(404).send(err);
    //     }
    //     // generate random token

    //     const resetToken = user.createPasswordResetToken();
    //     // await user.save()
    //     user.save({validateBeforeSave: false})

    //     const resetUrl = `${req.protocol}://${req.get('host')}/client/pswd/resetpswd/${resetToken}`
    //     const message = `Forgot Password? Submit a PATCH request with your new Password and passwordConfirn to: ${resetUrl}.\n If you didnt forget your password, please ignore this email!`;


    //     try {
    //       const msg = {
    //         to: user.email,
    //         from: '[no-reply]@kvetslueb.com.ng',
    //         subject: 'Password Reset (Valid for 10mins)',
    //         text: message
    //       }

    //       sgMail.send(msg, (err, info)=>{
    //         if(err){
    //           res.status(500).send(err);
    //         }
    //         res.status(200).json({
    //           status: 'success',
    //           message: 'Token sent to mail'
    //         });

    //       })

    //     } catch(err) {
    //         user.passwordResetToken = undefined;
    //         user.passwordResetExpires = undefined;
    //         user.save({validateBeforeSave: false})
    //         console.log(err);
    //     }
    // })
    // send it to user email
})

//Reset Password Route
router.get('/resetpswd', (req, res) =>{
    res.render('client/resetpswd')
});

router.get('/resetpswd/:token', function(req, res) {
    Client.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
          console.log('Password reset token is invalid or has expired.');
          
        // req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('client/resetpswd', {
        user: req.user
      });
    });
  });


  router.post('/resetpswd/:token', function(req, res) {
    async.waterfall([
      function(done) {
        Client.findOne({ passwordResetToken: req.params.token, passwordResetExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
              console.log('Password reset token is invalid or has expired.');
              
            // req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          else if(req.body.password === req.body.passwordConfirm) {
              user.password = req.body.password;
              user.passwordResetToken = undefined;
              user.passwordResetExpires = undefined;
              user.save(function(err) {
                req.logIn(user, function(err) {
                });
                  done(err, user);
                });
          }

          console.log('passwords dont match');
  
        });
      },
      function(user, done) {
        const message = {
            to: user.email,
            from: '[no-reply]@kvetslueb.com.ng',
            subject: 'Your password has been changed',
            text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        sgMail.send(message, (err)=>{
            console.log(`An email has been sent to ${user.email} with futher instructions`);
            done(err, 'done');
        })
        
        
      }
    ], function(err) {
      res.redirect('/');
    });
  });

// router.post('/resetpswd/:token', (req, res)=>{
//         Client.findOne({ passwordResetToken: req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user)=>{

//         })
//         // get user based on the token
//         const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
//         // const user =
//          Client.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()} }, (err, user) => {
//              if(err) {
//                  res.status(404).send(err);
//              }

//              user.password = req.body.password
//              user.password2 = req.body.password2
//              user.passwordResetToken = undefined;
//              user.passwordResetExpires = undefined;

//              user.save(err => {
//                  if(err) {
//                      res.status(200).send(err);
//                  }else{
//                  res.status(201).json({
//                      message: 'Successful'
//                  })
//                  res.redirect('/client/login');
//                 }
//              })

//             //  Redirect the user to login

//          });
//         // if token has not expired and user exists we set the new password
//     })

//Password Change Route
router.get('/pswdchange/:id', (req, res) =>{
    Client.findById(req.params.id, (err, client)=>{
        res.render('client.pswdchange',{
            client: client
        });
    })
});

//Password Change Process
router.patch('/pswdchange/:id', (req, res) => {
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
        }else{
            // res.status(201).json({
            //     message: 'Successfull'
            // })
            req.flash('success', 'Password Changed')
            res.redirect('/client/login');
        }
    })
})

module.exports = router;
