const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TransactionSchema = new mongoose.Schema(
  {
    ref: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
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


const Transaction = mongoose.model("Transaction", TransactionSchema)

module.exports = Transaction

