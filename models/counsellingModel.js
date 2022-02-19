const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const CounsellingSchema = new mongoose.Schema(
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
    counselling_prayerrequest: {
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

CounsellingSchema.statics.checkEmailAlreadyExist = async (email) => {
  const emailExists = await Counselling.findOne({ email })
  if (emailExists)
    return emailExists
}

CounsellingSchema.statics.checkUsernameAlreadyExist = async (username) => {
  const usernameExists = await Counselling.findOne({ username })
  if (usernameExists)
    return usernameExists
}

CounsellingSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await Counselling.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const Counselling = mongoose.model("Counselling", CounsellingSchema)

module.exports = Counselling

