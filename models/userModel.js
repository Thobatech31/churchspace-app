const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
          type: String,
          required: true,
          unique: true,
        },
        first_name: {
          type: String,
          required: true,
        },
        last_name: {
          type: String,
          required: true,
        },
        church_name: {
          type: String,
          required: true,
        },
        church_denomination: {
          type: String,
          required: true,
        },
        church_address: {
          type: String,
          required: true,
        },
        church_website: {
          type: String,
          required: true,
        },
        church_logo: {
          type: String,
          default: 'image url',
        },
        super: {
          type: String,
          required: true,
        },
        password:{
            type: String,
            required: true,
        },
        isAdmin:{
            type: Boolean,
            default: false,
        },
        resetLink:{
            type:String,
            default:'',
        },
        status: {
          type: String,
          default: 0,
        },
    },
    {timestamps : true}
);

UserSchema.statics.checkEmailAlreadyExist = async (email) => {
    const emailExists = await User.findOne({ email })
    if (emailExists)
        return emailExists   
}

UserSchema.statics.checkUsernameAlreadyExist = async (username) => {
    const usernameExists = await User.findOne({ username })
    if (usernameExists)
        return usernameExists   
}

UserSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await User.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const User =  mongoose.model("User", UserSchema)

module.exports = User

