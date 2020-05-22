var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
});

const goalSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    stock: {
        type: String,
        required: true
    },
    goal: {
        type: Array,
        required: true
    },
    validUntil: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

var users = mongoose.model('user', userSchema);
var goals = mongoose.model('goal', goalSchema);

module.exports = {
    user: users
}