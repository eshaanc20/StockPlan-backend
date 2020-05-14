var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const dataFormat = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    stocks: Array,
    goals: Array
});

var users = mongoose.model('user', dataFormat);

module.exports = {
    user: users
}