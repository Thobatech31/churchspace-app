var mongoose =  require('mongoose');
var Schema =  mongoose.Schema;

var employee = new Schema({
    name: String,
    adderess: String,
    phonenumber: String
});

// module.exports = mongoose.model('Employee', employee);
const Employee = mongoose.model("Employee", employee)

module.exports = Employee