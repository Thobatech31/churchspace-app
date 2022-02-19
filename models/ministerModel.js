const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ministerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
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
    alternative_mobile: {
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
    date_joined: {
      type: String,
      required: false,
    },
    home_address: {
      type: String,
      required: true,
    },
    office_address: {
      type: String,
      required: false,
    },
    occupation: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: 1,
    },
  },
  { timestamps: true }
);

ministerSchema.statics.checkEmailAlreadyExist = async (email) => {
  const emailExists = await Minister.findOne({ email })
  if (emailExists)
    return emailExists
}

ministerSchema.statics.checkUsernameAlreadyExist = async (username) => {
  const usernameExists = await Minister.findOne({ username })
  if (usernameExists)
    return usernameExists
}

ministerSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await Minister.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const Minister = mongoose.model("Minister", ministerSchema)

module.exports = Minister

