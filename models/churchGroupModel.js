const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const churchGroupSchema = new mongoose.Schema(
  {
    group: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

churchGroupSchema.statics.checkEmailAlreadyExist = async (email) => {
  const emailExists = await Group.findOne({ email })
  if (emailExists)
    return emailExists
}


churchGroupSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await Group.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const Group = mongoose.model("Group", churchGroupSchema)

module.exports = Group

