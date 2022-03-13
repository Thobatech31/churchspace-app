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


memberSchema.statics.trim_no = (number) => {
  //$number = " 08034470925   , 07034562134  , 07034562345, 	2348034470925 ";
  const numbers = number.replace('/\s+/', '', number);
  var array = numbers.split(",");
  var lengthofarray = count(array);
  for (i = 0; i < lengthofarray; $i++) {
    var exp = "/^0/";
    var txtreplace = "234";
    var str = array[i];
    array[i] = str.replace(exp, txtreplace, str);
    const finalouput = array.implode(",");
  }

  return finalouput;
}



// module.exports = mongoose.model("User", UserSchema);
const Member = mongoose.model("Member", memberSchema)

module.exports = Member

