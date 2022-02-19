const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const prayerRequestSchema = new mongoose.Schema(
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
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    prayer_request: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    firsttimerId: {
      type: Schema.Types.ObjectId,
      ref: "FirstTimer",
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

prayerRequestSchema.statics.checkEmailAlreadyExist = async (email) => {
  const emailExists = await PrayerRequest.findOne({ email })
  if (emailExists)
    return emailExists
}

prayerRequestSchema.statics.checkUsernameAlreadyExist = async (username) => {
  const usernameExists = await PrayerRequest.findOne({ username })
  if (usernameExists)
    return usernameExists
}

prayerRequestSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await PrayerRequest.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const PrayerRequest = mongoose.model("PrayerRequest", prayerRequestSchema)

module.exports = PrayerRequest

