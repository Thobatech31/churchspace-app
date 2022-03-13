const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const welfareSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    request_details: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    welfareImage: {
       type: String
    },
  },
  { timestamps: true }
);


const Welfare = mongoose.model("Welfare", welfareSchema)

module.exports = Welfare

