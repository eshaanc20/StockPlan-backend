var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const dataFormat = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    stocks: Array
});

var users = mongoose.model('user', dataFormat);

module.exports = {
    user: users
}