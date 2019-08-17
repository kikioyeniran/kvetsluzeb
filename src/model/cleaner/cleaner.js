import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const Schema = mongoose.Schema; 


const CleanerSchema = Schema({
    cleanerID:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
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

CleanerSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken}, this.passwordResetToken);
    
    this.passwordResetExpires = Date.now() + 10*60*1000; //10mins
    return resetToken;
}

CleanerSchema.methods.correctPassword =  function(
    candidatePassword,
    userPassword
  ) {
    return bcrypt.compare(candidatePassword, userPassword);
  };

CleanerSchema.set('timestamps', true);
let Cleaner = module.exports = mongoose.model('cleaner', CleanerSchema);


module.exports.createUser = (newUser, callback)=> {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) =>{
            newUser.password = hash;
            newUser.save(callback);
        })
    })
}