const mongoose = require('mongoose');

const superUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
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
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
    resetLink: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

superUserSchema.statics.checkEmailAlreadyExist = async (email) => {
  const emailExists = await Admin.findOne({ email })
  if (emailExists)
    return emailExists
}

superUserSchema.statics.checkUsernameAlreadyExist = async (username) => {
  const usernameExists = await Admin.findOne({ username })
  if (usernameExists)
    return usernameExists
}

superUserSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await Admin.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const Admin = mongoose.model("Admin", superUserSchema)

module.exports = Admin

