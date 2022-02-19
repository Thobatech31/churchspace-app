const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const FinancialSchema = new mongoose.Schema(
    {
        kind: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        tithe_giver_type: {
            type: String,
        },
        amount: {
            type: Number,
            required: true,
        },
        remark: {
            type: String,
        },
        offering_date: {
            type: String,
            required: false,
        },
        expenseCatoryId: {
            type: Schema.Types.ObjectId,
            ref: "ExpenseCategory",
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


// module.exports = mongoose.model("User", UserSchema);
const Financial = mongoose.model("Financial", FinancialSchema)

module.exports = Financial

