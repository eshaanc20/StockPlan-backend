var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var {Goal} = require('../db/mongoose.js');
var {GoalList} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');
var axios = require('axios');

//get all goal lists
router.get('/list/all', authentication, async function(req, res, next) {
    try {
        const response = await GoalList.find({userId: req.user._id});
        let goalLists = [...response];
        let updatedGoalLists = [];
        for (goalList of goalLists) {
            const goals = await Goal.find({userId: req.user._id, listNumber: goalList.listNumber});
            const goalsArray = [...goals]
            updatedGoalLists.push({
                name: goalList.name,
                listNumber: goalList.listNumber,
                length: goalsArray.length
            })
        }
        res.send({allLists: updatedGoalLists, requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//create new goals list
router.post('/list/new', authentication, async function(req, res, next) {
    try {
        const goals = await GoalList.find({userId: req.user._id})
        const goalList = [...goals]
        let newListNumber = 0;
        goalList.forEach(element => {
            if (newListNumber < element.listNumber) {
                newListNumber = element.listNumber
            }
        })
        newListNumber = newListNumber + 1;
        const info = {
            name: req.body.listName,
            userId: req.user._id,
            listNumber: newListNumber
        }
        const goalListExists = await GoalList.exists({name: req.body.listName});
        if (goalListExists) {
            res.send({requestStatus: false});
        } else {
            const newGoalList = new GoalList(info);
            await newGoalList.save();
            res.send({requestStatus: true});
        }
    } catch(error) {
        res.status(404).send({requestStatus: false});
    }
});

//get all goals in list
router.get('/list/:id', authentication, async function(req, res, next) {
    try {
        const listInformation = await GoalList.findOne({listNumber: req.params.id, userId: req.user._id})
        const goalsList = await Goal.find({listNumber: req.params.id, userId: req.user._id});
        const listName = listInformation.name;
        const goals = [...goalsList];
        let goalsInformation = [];
        for (goal of goals) {
            let response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + goal.stock + '&token=btpsg2n48v6rdq37lt60');
            let goalProgress = 100 - ((Math.abs(response.data.c - Number(goal.goalTargetNumber)) / response.data.c) * 100);
            goalProgress = Math.round(goalProgress);
            if (goal.goalType == 'buy' && ((response.data.c - Number(goal.goalTargetNumber)) < 0)) {
                goalProgress = 100;
            } else if (goal.goalType == 'sell' && ((response.data.c - Number(goal.goalTargetNumber)) > 0)){
                goalProgress = 100;
            }
            let goalComplete = false;
            if (goalProgress >= 100) {
                goalComplete = true;
            }
            const currentPrice = Math.round(response.data.c * 100) / 100;
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
                currentValue: currentPrice,
                progress: goalProgress,
                read: goal.read,
                id: goal._id
            }
            goalsInformation.push(goalInfo);
        }
        res.send({requestStatus: true, name: listName, goalsDetail: goalsInformation});
    } catch(error) {
        res.status(404).send({requestStatus: false});
    }
});

//add a new stock goal to list
router.post('/list/:id', authentication, async function(req, res, next) {
    try {
        const goalInfo = {
            title: req.body.goalTitle,
            goalType: req.body.goalType,
            description: req.body.goalDescription,
            stock: req.body.stockSymbol,
            goalParameter: req.body.goalParameter,
            goalTargetNumber: req.body.goalTargetNumber,
            validUntil: req.body.validUntilDate,
            goalCompleted: false,
            goalCompletedDate: " ",
            read: false,
            listNumber: req.params.id,
            userId: req.user._id
        }
        const newGoal = new Goal(goalInfo);
        await newGoal.save()
        res.send({requestStatus: true});
    } catch(error) {
        res.status(404).send({requestStatus: false});
    }
});

//read completed goal
router.put('/:id/read', authentication, async function(req, res, next) {
    try {
        await Goal.updateOne({_id: req.params.id, userId: req.user._id}, {read: true});
        res.send({requestStatus: true});
    } catch(error) {
        console.log(error);
        res.status(404).send({requestStatus: false});
    }
});

//delete a goal from list
router.delete('/:id', authentication, async function(req, res, next) {
    try {
        await Goal.deleteOne({_id: req.params.id, userId: req.user._id});
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;


