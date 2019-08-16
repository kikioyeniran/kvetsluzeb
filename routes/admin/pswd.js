const express = require('express');
const router = express.Router();
const sendEmail  = require('../email');
//Bring in Admin Models
let Admin =  require('../../models/admin');

//Forgot Password Page Route
router.get('/forgotpswd', (req, res) =>{
    res.render('admin/forgotpswd');
});

//Reset Password Mailing Route
router.post('/forgotpswd',  (req,res) =>{
    // get user based on posted email
    Admin.findOne({email: req.body.email}, (err, user) =>{
        if (err) {
            res.status(404).send(err);
        }
        // generate random token

        const resetToken = user.createPasswordResetToken();
        // await user.save()
        user.save({validateBeforeSave: false})

        const resetUrl = `${req.protocol}://${req.get('host')}/admin/pswd/resetpswd/${resetToken}`
        const message = `Forgot Password? Submit a PATCH request with your new Password and passwordConfirn to: ${resetUrl}.\n If you didnt forget your password, please ignore this email!`
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

//Reset Password Page Route
router.get('/resetpswd', (req, res) =>{
    res.render('admin/resetpswd');
});

//Reset Password Submit form Route
router.patch('/resetpswd/:token', (req, res)=>{

    // get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    // const user =
     Admin.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()} }, (err, user) => {
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
             res.redirect('/admin/login');
            }
         })

        //  Redirect the user to login

     });
    // if token has not expired and user exists we set the new password
})

//Password Change Route
router.get('/pswdchange/:id', (req, res) =>{
    ApplicationCache.findById(req.params.id, (err, admin)=>{
        res.render('admin.pswdchange',{
            admin: admin
        });
    })
});

//Password Change Process
router.patch('/pswdchange/:id', (req, res) => {
    // get user from collection
    Admin.findById(req.id, (err, user) => {
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
            res.redirect('/admin/login');
        }
    })
})

module.exports = router;