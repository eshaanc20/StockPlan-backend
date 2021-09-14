var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.connect(process.env.mongodb_URL, {
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
    }
});

const goalListSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    listNumber: {
        type: Number,
        required: true
    }
});

const goalSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    goalType: {
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
    goalParameter: {
        type: String,
        required: true
    },
    goalTargetNumber: {
        type: String,
        required: true
    },
    validUntil: {
        type: String,
        required: true
    },
    goalCompleted: {
        type: Boolean,
        required: true
    },
    goalCompletedDate: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        required: true
    },
    listNumber: {
        type: Number,
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
    listNumber: {
        type: Number,
        required: true
    }
});

const portfolioSchema = mongoose.Schema({
    stock: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});


var users = mongoose.model('user', userSchema);
var goalLists = mongoose.model('goalList', goalListSchema);
var goals = mongoose.model('goal', goalSchema);
var watchlists = mongoose.model('stocklist', watchlistSchema);
var portfolio = mongoose.model('portfolio', portfolioSchema);

module.exports = {
    User: users,
    GoalList: goalLists,
    Goal: goals,
    Watchlist: watchlists,
    Portfolio: portfolio
}