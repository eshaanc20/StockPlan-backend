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
        let stocks = [];
        for (stock of watchlist.stocks) {   
            let response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + stock + '&token=btpsg2n48v6rdq37lt60');
            let changeAmount = (Math.abs(response.data.c - response.data.pc))/response.data.pc;
            changeAmount = (Math.round(changeAmount * 10000))/100
            let amountDifference = Math.abs(response.data.c - response.data.pc);
            amountDifference = (Math.round(amountDifference * 100))/100
            let changeDirection = (response.data.c - response.data.o) > 0? "increase": "decrease";
            let moreDataResponse = await axios.get('https://finnhub.io/api/v1/stock/metric?symbol=' + stock + '&metric=all&token=btpsg2n48v6rdq37lt60');
            let highDaily = Math.round(response.data.h * 100) / 100;
            let lowDaily = Math.round(response.data.l * 100) / 100;
            let high52WeekPrice = Math.round(moreDataResponse.data.metric['52WeekHigh'] * 100) / 100;
            let low52WeekPrice = Math.round(moreDataResponse.data.metric['52WeekLow'] * 100) / 100;
            let marketValue = moreDataResponse.data.metric.marketCapitalization / 1000;
            let epsNumber = Math.round(moreDataResponse.data.metric.epsNormalizedAnnual * 100) / 100;
            let dividentYieldNumber = Math.round(moreDataResponse.data.metric.dividendYieldIndicatedAnnual * 100) / 100;
            let epsGrowthNumber = Math.round(moreDataResponse.data.metric.epsGrowth5Y * 100) / 100;
            let profitEarningNumber = Math.round(moreDataResponse.data.metric.peNormalizedAnnual * 100) / 100;
            let netMarginNumber = Math.round(moreDataResponse.data.metric.netProfitMarginAnnual * 100) / 100;
            const info = {
                symbol: stock,
                current: response.data.c,
                open: response.data.o,
                high: highDaily,
                low: lowDaily,
                previousClosePrice: response.data.pc,
                change: changeDirection,
                percentChange: changeAmount,
                amountChange: amountDifference,
                high52Week: high52WeekPrice,
                low52Week: low52WeekPrice,
                marketCap: marketValue,
                eps: epsNumber,
                epsGrowth: epsGrowthNumber,
                dividendYield: dividentYieldNumber,
                profitEarningRatio: profitEarningNumber,
                netProfitMargin: netMarginNumber
            }
            stocks.push(info);
        };
        res.send({name: watchlist.name, stockDetail: stocks, length: watchlist.stocks.length});
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