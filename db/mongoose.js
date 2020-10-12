var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://127.0.0.1:27017/StockPlan', {
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
});

const watchlistSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    stocks: {
        type: Array,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    listId: {
        type: String,
        required: true
    }
});

userSchema.virtual('goals', {
    ref: 'goal',
    localField: '_id',
    foreignField: 'userId'
});

var users = mongoose.model('user', userSchema);
var goals = mongoose.model('goal', goalSchema);
var watchlists = mongoose.model('watchlist', watchlistSchema);

module.exports = {
    User: users,
    Goal: goals,
    Watchlist: watchlists
}