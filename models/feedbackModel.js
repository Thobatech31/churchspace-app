const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    feedback_message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);


const Feedback = mongoose.model("Feedback", feedbackSchema)

module.exports = Feedback

