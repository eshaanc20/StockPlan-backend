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
router.get('/all', authentication, async function(req, res, next) {
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
                axios.get('https://finnhub.io/api/v1/quote?symbol=' + stock + '')
                    .then(response => {
                        const info = {
                            symbol: stock,
                            ...response.data,
                        }
                        responses.push(response.data);
                    })
                    .catch(error => {
                        console.log(error);
                    })
            }
        );
        res.send({name: watchlist.name, list: responses});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//create new watchlist
router.post('/new', authentication, async function(req, res, next) {
    try {
        const info = {
            name: req.body.name,
            stocks: [],
            userId: req.user._id
        }
        const watchlistExists = await Watchlist.exists({name: req.body.name});
        if (watchlistExists) {
            res.status(200).send({requestStatus: false});
        } else {
            const newWatchlist = new Watchlist(info);
            await newWatchlist.save();
            res.send({requestStatus: true});
        }
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//add to watchlist
router.post('/:id', authentication, async function(req, res, next) {
    try {
        const list = await Watchlist.findOne({_id: req.params.id, userId: req.user._id});
        const stockList = [...list.stocks, req.body.newStock];
        const newList = await Watchlist.updateOne({_id: req.params.id, userId: req.user._id}, {stocks: stockList});
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;