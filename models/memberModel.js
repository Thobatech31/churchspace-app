const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const memberSchema = new mongoose.Schema(
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
      required: false,
    },
    dob: {
      type: String,
      required: false,
    },
    photo: {
      type: String,
      required: false,
      default:"my photo"
    },
    mdepartment: {
      type: Array,
      required: false,
    },
    mchurch_group: {
      type: Array,
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

memberSchema.statics.checkEmailAlreadyExist = async (email) => {
  const emailExists = await Member.findOne({ email })
  if (emailExists)
    return emailExists
}

memberSchema.statics.checkUsernameAlreadyExist = async (username) => {
  const usernameExists = await Member.findOne({ username })
  if (usernameExists)
    return usernameExists
}

memberSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await Member.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const Member = mongoose.model("Member", memberSchema)

module.exports = Member

