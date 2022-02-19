const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const departmentSchema = new mongoose.Schema(
  {
    department: {
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
      default: 0,
    },
    // categories: {
    //   type: Array,
    //   required: false,
    // },
  },
  { timestamps: true }
);

departmentSchema.statics.checkEmailAlreadyExist = async (email) => {
  const emailExists = await Department.findOne({ email })
  if (emailExists)
    return emailExists
}


departmentSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await Department.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}


// module.exports = mongoose.model("User", UserSchema);
const Department = mongoose.model("Department", departmentSchema)

module.exports = Department

