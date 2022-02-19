const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new mongoose.Schema(
    {
        service_title:{
            type: String,
            required: true,
        },
        men_attd:{
            type: Number,
            required: true,
        },
        women_attd: {
            type: Number,
            required: true,
        },
        children_attd: {
            type: Number,
            required: true,
        },
        total_attd: {
            type: Number,
            required: true,
        },
        date_attendance: {
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
    {timestamps : true}
);

AttendanceSchema.statics.checkEmailAlreadyExist = async (email) => {
    const emailExists = await Attendance.findOne({ email })
    if (emailExists)
        return emailExists
}

AttendanceSchema.statics.checkUsernameAlreadyExist = async (username) => {
    const usernameExists = await Attendance.findOne({ username })
    if (usernameExists)
        return usernameExists
}
AttendanceSchema.statics.checkMobileAlreadyExist = async (mobile) => {
    const mobileExists = await Attendance.findOne({ mobile })
    if (mobileExists)
        return mobileExists
}

// module.exports = mongoose.model("Attendance", AttendanceSchema);
const Attendance =  mongoose.model("Attendance", AttendanceSchema)

module.exports = Attendance

