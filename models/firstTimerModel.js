const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const firstTimerSchema = new mongoose.Schema(
  {
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
      required: false,
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
    ministerId: {
      type: Schema.Types.ObjectId,
      ref: "Minister",
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    status: {
      type: String,
      default: 1,
    },
  },
  { timestamps: true }
);

firstTimerSchema.statics.checkEmailAlreadyExist = async (email) => {
  const emailExists = await FirstTimer.findOne({ email })
  if (emailExists)
    return emailExists
}

firstTimerSchema.statics.checkUsernameAlreadyExist = async (username) => {
  const usernameExists = await FirstTimer.findOne({ username })
  if (usernameExists)
    return usernameExists
}

firstTimerSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await FirstTimer.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const FirstTimer = mongoose.model("FirstTimer", firstTimerSchema)

module.exports = FirstTimer

