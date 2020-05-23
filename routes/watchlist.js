var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var {Goal} = require('../db/mongoose.js');
var {Watchlist} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');
var axios = require('axios');

//get all user watchlists
router.get('/user', authentication, async function(req, res, next) {
    try {
        const watchlists = await Watchlist.find({userId: req.user._id});
        res.send({allLists: watchlists});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//get watchlist information
router.get('/information', authentication, async function(req, res, next) {
    try {
        const watchlist = await Watchlist.findOne({_id: req.body.listId, userId: req.user._id});
        let responses = [];
        watchlist.stocks.forEach((stock) => {
            try {
                const response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + stock + '&token=br1ie2frh5reisn53n3g');
                const info = {
                    symbol: stock,
                    ...response.data,
                }
                responses.push(response.data);
            } catch (error) {
                console.log(error);
            }
        });
        res.send({name: watchlist.name, list: responses});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//create new watchlist
router.post('/', authentication, async function(req, res, next) {
    try {
        const info = {
            title: req.body.name,
            stocks: [],
            userId: req.user._id
        }
        const newWatchlist = new Watchlist(info);
        await newWatchlist.save();
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;