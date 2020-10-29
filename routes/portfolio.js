var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var {Goal} = require('../db/mongoose.js');
var {Portfolio} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');
var axios = require('axios');

router.post('/', async function(req, res, next) {
    try {
        const info = {
            symbol: req.body.symbol,
            shares: req.body.shares,
            price: req.body.price,
            userId: req.user._id
        }
        const portfolio = new Portfolio(info);
        await portfolio.save();
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

router.get('/', async function(req, res, next) {
    try {
        const response = Portfolio.find({userId: req.user._id});
        const portfolioData = [...response];
        let portfolio = [];
        let stocks = []
        for (data of portfolioData) {
            let response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + data.stock + '&token=btpsg2n48v6rdq37lt60');
            const marketValue = response.data.c * data.shares
            const bookValue = data.price * data.shares
            portfolio.push({
                ...data,
                marketValue: marketValue,
                bookValue: bookValue
            })
            let changeAmount = (Math.abs(response.data.c - response.data.pc))/response.data.pc;
            changeAmount = (Math.round(changeAmount * 10000))/100
            let amountDifference = Math.abs(response.data.c - response.data.pc);
            amountDifference = (Math.round(amountDifference * 100))/100
            let changeDirection = (response.data.c - response.data.o) > 0? "increase": "decrease";
            let moreDataResponse = await axios.get('https://finnhub.io/api/v1/stock/metric?symbol=' + data.stock + '&metric=all&token=btpsg2n48v6rdq37lt60');
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
            const info = {
                symbol: stock,
                current: response.data.c,
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
        }
        let overallChange;
        if (overallChangeAmount >= 0) {
            overallChange = "increase"
        } else {
            overallChange = "decrease"
        }
        overallChangeAmount = Math.abs(overallChangeAmount);
        overallChangeAmount = (Math.round(overallChangeAmount * 100)) / 100
        const stockData = {
            name: watchlist.name, 
            stockDetail: stocks, 
            totalChange: overallChange, 
            totalChangeAmount: overallChangeAmount,
            length: watchlist.stocks.length
        }
        const listInformation = await GoalList.findOne({listNumber: req.params.id, userId: req.user._id})
        const goalsList = await Goal.find({listNumber: req.params.id, userId: req.user._id});
        const listName = listInformation.name;
        const goals = [...goalsList];
        let goalsInformation = [];
        for (goal of goals) {
            let response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + goal.stock + '&token=btpsg2n48v6rdq37lt60');
            let goalProgress = (100 - ((Math.abs(response.data.c - Number(goal.goalTargetNumber)) / response.data.c) * 100))
            goalProgress = Math.round(goalProgress);
            if (goal.goalType == 'buy' && ((response.data.c - Number(goal.goalTargetNumber)) < 0)) {
                goalProgress = 100;
            } else if (goal.goalType == 'sell' && ((response.data.c - Number(goal.goalTargetNumber)) > 0)){
                goalProgress = 100;
            }
            let goalComplete = false;
            if (goalProgress === 100) {
                goalComplete = true;
            }
            let goalInfo = {
                title: goal.title,
                goalType: goal.goalType,
                description: goal.description,
                stock: goal.stock,
                goalParameter: goal.goalParameter,
                goalTargetNumber: goal.goalTargetNumber,
                validUntil: goal.validUntil,
                goalCompleted: goalComplete,
                goalCompletedDate: " ",
                currentValue: response.data.c,
                progress: goalProgress,
                goalId: goal._id
            }
            goalsInformation.push(goalInfo);
        }
        res.send({requestStatus: true, name: listName, goalsDetail: goalsInformation});
        res.send({portfolio: portfolio, stocks: stockData, goals: goalsInformation, requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;