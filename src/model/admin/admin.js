import mongoose from 'mongoose';
import validator from 'validator';

//Cleaner schema
const AdminSchema = mongoose.Schema({
    email:{
        type: String,
        required: true
    },
    // username:{
    //     type: String,
    //     required: true
    // },
    password:{
        type: String,
        required: true
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
          // This only works on CREATE and SAVE!!!
          validator: function(el) {
            return el === this.password;
          },
          message: 'Passwords are not the same!'
        }
    },
    passwordResetToken: String,
    passwordResetExpires: Date
});

AdminSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken}, this.passwordResetToken);
    
    this.passwordResetExpires = Date.now() + 10*60*1000; //10mins
    return resetToken;
}

AdminSchema.methods.correctPassword =  function(
    candidatePassword,
    userPassword
  ) {
    return bcrypt.compare(candidatePassword, userPassword);
  };
const Admin = module.exports = mongoose.model('admin', AdminSchema);

module.exports.createUser = (newUser, callback)=> {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) =>{
            newUser.password = hash;
            newUser.save(callback);
        })
    })
}