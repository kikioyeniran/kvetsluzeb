const express = require('express');
const router = express.Router();
const sendEmail  = require('../email');
//Bring in Client Models
let Client =  require('../../models/client');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');


router.get('/forgotpswd', (req, res) =>{
    res.render('client/forgotpswd');
});

//Forgot Password Post Process
router.post('/forgotpswd',  (req,res) =>{
    // get user based on posted email
    Client.findOne({email: req.body.email}, (err, user) =>{
        if (err) {
            res.status(404).send(err);
        }
        // generate random token

        const resetToken = user.createPasswordResetToken();
        // await user.save()
        user.save({validateBeforeSave: false})

        const resetUrl = `${req.protocol}://${req.get('host')}/client/pswd/resetpswd/${resetToken}`
        const message = `Forgot Password? Submit a PATCH request with your new Password and passwordConfirn to: ${resetUrl}.\n If you didnt forget your password, please ignore this email!`;

        try {
          const msg = {
            to: user.email,
            from: '[no-reply]@kvetslueb.com.ng',
            subject: 'Password Reset (Valid for 10mins)',
            text: message
          }
            
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

//Reset Password Route
router.get('/resetpswd', (req, res) =>{
    res.render('client/resetpswd')
});

router.patch('/resetpswd/:token', (req, res)=>{

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
                 }else{
                 res.status(201).json({
                     message: 'Successful'
                 })
                 res.redirect('/client/login');
                }
             })

            //  Redirect the user to login

         });
        // if token has not expired and user exists we set the new password
    })

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
