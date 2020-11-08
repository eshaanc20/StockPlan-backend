var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var {Goal} = require('../db/mongoose.js');
var {Portfolio} = require('../db/mongoose.js');
var {GoalList} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');
var axios = require('axios');
const e = require('express');

router.post('/', authentication, async function(req, res, next) {
    try {
        const info = {
            stock: req.body.stock,
            shares: req.body.shares,
            price: req.body.price,
            userId: req.user._id
        }
        const portfolio = new Portfolio(info);
        await portfolio.save();
        res.send({requestStatus: true});
    } catch(error) {
        console.log(error)
        res.status(404).send({requestStatus: false});
    }
});

router.get('/', authentication, async function(req, res, next) {
    try {
        const response = await Portfolio.find({userId: req.user._id});
        let portfolioList = [...response];
        let portfolio = [];
        let stocks = []
        let overallChangeAmount = 0;
        for (data of portfolioList) {
            let response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + data.stock + '&token=btpsg2n48v6rdq37lt60');
            const market = Math.round((response.data.c * data.shares) * 100) / 100
            const bookValue = Math.round((data.price * data.shares) * 100) / 100
            const amountChanged = Math.round(Math.abs((market - bookValue))*100) / 100
            const change = Math.round(Math.abs((market - bookValue))/bookValue * 10000) / 100
            const direction = (market - bookValue) < 0? 'decrease': 'increase';
            portfolio.push({
                stock: data.stock,
                shares: data.shares,
                price: data.price,
                marketValue: market,
                bookValue: bookValue,
                changeAmount: amountChanged,
                change: change,
                changeDirection: direction,
                id: data._id,
            })
            let changeAmount = (Math.abs(response.data.c - response.data.pc))/response.data.pc;
            changeAmount = (Math.round(changeAmount * 10000))/100
            let amountDifference = Math.abs(response.data.c - response.data.pc);
            amountDifference = (Math.round(amountDifference * 100))/100
            const changeDirection = response.data.c < response.data.o? "decrease": "increase";
            const info = {
                symbol: data.stock,
                current: response.data.c,
                change: changeDirection,
                percentChange: changeAmount,
                amountChange: amountDifference,
            }
            stocks.push(info);
        }
        let totalBookValue = 0;
        let totalMarketValue = 0;
        for (let element of portfolio) {
            totalBookValue += element.bookValue;
            totalMarketValue += element.marketValue;
        }
        totalBookValue = Math.round(totalBookValue * 100) / 100;
        totalMarketValue = Math.round(totalMarketValue * 100) / 100;
        let totalChangeAmount = Math.round(Math.abs(totalMarketValue - totalBookValue) * 100) / 100;
        let totalChange = Math.round((Math.abs(totalMarketValue - totalBookValue))/totalBookValue * 10000) / 100
        const totalChangeDirection = totalMarketValue < totalBookValue? "decrease": "increase";
        const portfolioData = {
            stocksDetail: portfolio,
            totalBookValue: totalBookValue,
            totalMarketValue: totalMarketValue,
            totalChangeAmount: totalChangeAmount,
            totalChange: totalChange,
            totalChangeDirection: totalChangeDirection
        }
        const overallChange = overallChangeAmount >= 0? "increase": "decrease"
        overallChangeAmount = Math.abs(overallChangeAmount);
        overallChangeAmount = (Math.round(overallChangeAmount * 100)) / 100
        const stockData = {
            name: "portfolio", 
            stocksDetail: stocks, 
            totalChange: overallChange, 
            totalChangeAmount: overallChangeAmount,
            length: stocks.length
        }
        const goalsList = await Goal.find({listNumber: 1, userId: req.user._id});
        const goals = [...goalsList];
        let goalsData = [];
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
            goalsData.push(goalInfo);
        }
        res.send({portfolio: portfolioData, stocks: stockData, goals: goalsData, requestStatus: true});
    } catch(error) {
        console.log(error)
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;