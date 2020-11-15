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
router.get('/list/all', authentication, async function(req, res, next) {
    try {
        const watchlists = await Watchlist.find({userId: req.user._id});
        const stockLists = [...watchlists]
        res.send({allLists: stockLists, requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//get watchlist information
router.get('/list/:id', authentication, async function(req, res, next) {
    try {
        const watchlist = await Watchlist.findOne({listNumber: parseInt(req.params.id), userId: req.user._id});
        let stocks = [];
        let overallChangeAmount = 0;
        for (stock of watchlist.stocks) {   
            let response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + stock + '&token=btpsg2n48v6rdq37lt60');
            let changeAmount = (Math.abs(response.data.c - response.data.pc))/response.data.pc;
            changeAmount = (Math.round(changeAmount * 10000))/100
            let amountDifference = Math.abs(response.data.c - response.data.pc);
            amountDifference = (Math.round(amountDifference * 100))/100
            let changeDirection = (response.data.c - response.data.o) > 0? "increase": "decrease";
            let moreDataResponse = await axios.get('https://finnhub.io/api/v1/stock/metric?symbol=' + stock + '&metric=all&token=btpsg2n48v6rdq37lt60');
            let openDaily = Math.round(response.data.o * 100) / 100;
            let highDaily = Math.round(response.data.h * 100) / 100;
            let lowDaily = Math.round(response.data.l * 100) / 100;
            let high52WeekPrice = Math.round(moreDataResponse.data.metric['52WeekHigh'] * 100) / 100;
            let low52WeekPrice = Math.round(moreDataResponse.data.metric['52WeekLow'] * 100) / 100;
            let marketValue = moreDataResponse.data.metric.marketCapitalization / 1000;
            let epsNumber = Math.round(moreDataResponse.data.metric.epsNormalizedAnnual * 100) / 100;
            let dividendYieldNumber = Math.round(moreDataResponse.data.metric.dividendYieldIndicatedAnnual * 100) / 100;
            let profitEarningNumber = Math.round(moreDataResponse.data.metric.peNormalizedAnnual * 100) / 100;
            let betaNumber = Math.round(moreDataResponse.data.metric.beta * 100) / 100;
            if (changeDirection === "increase") {
                overallChangeAmount += changeAmount;
            } else {
                overallChangeAmount -= changeAmount;
            }
            const currentPrice = Math.round(response.data.c * 100) / 100;
            const info = {
                symbol: stock,
                current: currentPrice,
                open: openDaily,
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
                dividendYield: dividendYieldNumber,
                profitEarningRatio: profitEarningNumber,
                betaValue: betaNumber,
            }
            stocks.push(info);
        };
        let overallChange;
        if (overallChangeAmount >= 0) {
            overallChange = "increase"
        } else {
            overallChange = "decrease"
        }
        overallChangeAmount = Math.abs(overallChangeAmount);
        overallChangeAmount = (Math.round(overallChangeAmount * 100)) / 100
        res.send({
            name: watchlist.name, 
            id: watchlist.id,
            stockDetail: stocks, 
            totalChange: overallChange, 
            totalChangeAmount: overallChangeAmount,
            length: watchlist.stocks.length});
    } catch (error) {
        res.status(404).send({requestStatus: false});
    }
});

//create new watchlist
router.post('/list/new', authentication, async function(req, res, next) {
    try {
        const watchlists = await Watchlist.find({userId: req.user._id});
        const stockLists = [...watchlists]
        let newListNumber = 0;
        stockLists.forEach(element => {
            if (newListNumber < element.listNumber) {
                newListNumber = element.listNumber
            }
        })
        newListNumber = newListNumber + 1;
        const info = {
            name: req.body.listName,
            stocks: [],
            userId: req.user._id,
            listNumber: newListNumber
        }
        const watchlistExists = await Watchlist.exists({name: req.body.listName});
        if (watchlistExists) {
            res.send({requestStatus: false});
        } else {
            const newWatchlist = new Watchlist(info);
            await newWatchlist.save();
            res.send({requestStatus: true});
        }
    } catch(error) {
        res.status(404).send({requestStatus: false});
    }
});

//add to watchlist
router.post('/list/:id', authentication, async function(req, res, next) {
    try {
        const list = await Watchlist.findOne({listNumber: req.params.id, userId: req.user._id});
        const stockList = [...list.stocks, req.body.stockSymbol];
        await Watchlist.updateOne({listNumber: req.params.id, userId: req.user._id}, {stocks: stockList});
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//delete a watchlist
router.delete('/list/:id', authentication, async function(req, res, next) {
    try {
        await Watchlist.deleteOne({listId: req.params.id});
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//delete a stock from list
router.delete('/list/:id/:symbol', authentication, async function(req, res, next) {
    try {
        const list = await Watchlist.findOne({listNumber: req.params.id, userId: req.user._id});
        let newStocks = [...list.stocks];
        newStocks = newStocks.filter(stock => {
            return stock != req.params.symbol
        })
        await Watchlist.updateOne({listNumber: req.params.id, userId: req.user._id}, {stocks: newStocks})
        res.send({requestStatus: true});
    } catch(error) {
        console.log(error)
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;