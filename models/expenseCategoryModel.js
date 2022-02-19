const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseCategorySchema = new mongoose.Schema(
    {
        expense_name:{
            type: String,
            required: true,
            unique: true,
        },
        expense_description:{
            type: String,
            required: true,
            unique: true,
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
    {timestamps : true}
);


// module.exports = mongoose.model("ExpenseCategory", ExpenseCategorySchema);
const ExpenseCategory =  mongoose.model("ExpenseCategory", ExpenseCategorySchema)

module.exports = ExpenseCategory

