var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var {Goal} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');

//get all user goals
router.get('/user', authentication, function(req, res, next) {
    try {
        await req.user.populate('goals').execPopulate();
        res.send(req.user.goals);
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//get a goal
router.get('/:id', authentication, function(req, res, next) {
    try {
        const oneGoal = await Goal.findOne({_id: req.params.id});
        return oneGoal;
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//add a new goal
router.post('/', authentication, function(req, res, next) {
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

//delete a goal
router.delete('/', authentication, function(req, res, next) {
    try {
        await Goal.deleteOne({_id: req.body.id});
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});


