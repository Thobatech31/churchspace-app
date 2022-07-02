const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require('cors');


//import Routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const dashboardRoute = require('./routes/dashboard')
const groupRoute = require('./routes/churchGroup');
const departmentRoute = require('./routes/department');
const memberRoute = require('./routes/member');
const ministerRoute = require('./routes/minister');
const firstTimerRoute = require('./routes/firstTimer');
const counsellingRoute = require('./routes/counselling');
const prayerRequestRoute = require('./routes/prayerRequest');
const attendanceRoute = require('./routes/attendance');
const expenseCategoryRoute = require('./routes/expenseCategory');
const financialRoute = require('./routes/financial');
const feedbackRoute = require('./routes/feedback');
const employeeRoute = require('./routes/employee');
const sendSmsRoute = require('./routes/sendSms');
const welfareRoute = require('./routes/welfare');
const bulkuploadRoute = require('./routes/bulkupload');


dotenv.config();


//Middlewares
app.use(cors());
app.use(express.json());

//Connect to Database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(console.log("connected To Mondo DB"))
  .catch((err) => console.log(err));


// //Routes Middleware
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/group', groupRoute);
app.use('/api/department', departmentRoute);
app.use('/api/member', memberRoute);
app.use('/api/minister', ministerRoute);
app.use('/api/firsttimer', firstTimerRoute);
app.use('/api/counselling', counsellingRoute);
app.use('/api/prayerrequest', prayerRequestRoute);
app.use('/api/attendance', attendanceRoute);
app.use('/api/expensecategory', expenseCategoryRoute);
app.use('/api/financial', financialRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/sendsms', sendSmsRoute);
app.use('/api/welfare', welfareRoute);
app.use('/api/bulk', bulkuploadRoute);



const PORT = process.env.PORT || 5000
app.listen(
  PORT,
  console.log(`The app is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

