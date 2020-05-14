var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1:27017/StockPlan', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const dataFormat = new Schema({
    firstName: String,
    lastName: String,
    username: String,
    email: String,
    password: String,
    stocks: Array,
    goals: Array
});

var users = mongoose.model('user', dataFormat);

module.exports = {
    user: users
}