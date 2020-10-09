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
        const stockLists = [...watchlists]
        res.status(200).send({allLists: stockLists});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//get watchlist information
router.get('/:id', authentication, async function(req, res, next) {
    try {
        const watchlist = await Watchlist.findOne({listNumber: parseInt(req.params.id), userId: req.user._id});
        let responses = [];
        for (stock of watchlist.stocks) {   
            let response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + stock + '&token=btpsg2n48v6rdq37lt60');
            const info = {
                symbol: stock,
                current: response.data.c,
                high: response.data.h,
                low: response.data.l,
            }
            responses.push(info);
        };
        res.send({name: watchlist.name, stockDetail: responses, length: watchlist.stocks.length});
    } catch (error) {
        console.log(error);
        res.status(404).send({requestStatus: false});
    }
});

//create new watchlist
router.post('/new', authentication, async function(req, res, next) {
    try {
        const watchlists = await Watchlist.find({userId: req.user._id});
        const stockLists = [...watchlists]
        let newListNumber = 0;
        stockLists.forEach(element => {
            if (newListNumber < element.listNumber) {
                newListNumber = element.listNumber
            }
        })
        newListNumber = listNumber + 1;
        const info = {
            name: req.body.listName,
            stocks: [],
            userId: req.user._id,
            listNumber: newListNumber
        }
        const watchlistExists = await Watchlist.exists({name: req.body.name});
        if (watchlistExists) {
            res.status(200).send({requestStatus: false});
        } else {
            const newWatchlist = new Watchlist(info);
            await newWatchlist.save();
            res.status(200).send({requestStatus: true});
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

//delete a watchlist
router.delete('/:id', authentication, async function(req, res, next) {
    try {
        await Watchlist.deleteOne({listId: req.params.id});
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;