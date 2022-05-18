const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require('cors');


//import Routes
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoutes');
const dashboardRoute = require('./routes/dashboardRoute')
const groupRoute = require('./routes/churchGroupRoute');
const departmentRoute = require('./routes/departmentRoute');
const memberRoute = require('./routes/memberRoute');
const ministerRoute = require('./routes/ministerRoute');
const firstTimerRoute = require('./routes/firstTimerRoute');
const counsellingRoute = require('./routes/counsellingRoute');
const prayerRequestRoute = require('./routes/prayerRequestRoute');
const attendanceRoute = require('./routes/attendanceRoute');
const expenseCategoryRoute = require('./routes/expenseCategoryRoute');
const financialRoute = require('./routes/financialRoute');
const feedbackRoute = require('./routes/feedbackRoute');
const employeeRoute = require('./routes/employeeRoute');
const sendSmsRoute = require('./routes/sendSmsRoute');
const welfareRoute = require('./routes/welfareRoute');
const bulkuploadRoute = require('./routes/bulkuploadRoute');


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

