var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var {Goal} = require('../db/mongoose.js');
var {GoalList} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');

//get all goal lists
router.get('/list/all', authentication, async function(req, res, next) {
    try {
        const goals = await GoalList.find({userId: req.user._id});
        const goalLists = [...goals]
        res.send({allLists: goalLists, requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//create new goals list
router.post('/new', authentication, async function(req, res, next) {
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
        const oneGoal = await Goal.findOne({_id: req.params.id});
        return oneGoal;
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//add a new goal to list
router.post('/list/:id', authentication, async function(req, res, next) {
    try {
        const goalInfo = {
            ...req.body,
        }
        const newGoal = new Goal(goalInfo);
        await newGoal.save()
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//delete a goal list
router.delete('/list/:id', authentication, async function(req, res, next) {
    try {
        await Goal.deleteOne({_id: req.body.id});
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;


