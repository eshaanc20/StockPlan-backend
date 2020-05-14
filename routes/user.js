var express = require('express');
var router = express.Router();
var {user} = require('../db/mongoose.js');

//login
router.post('/login', function(req, res, next) {
    user.findOne({email: req.body.email}).then(document => {
        if (document.password == req.body.password) {
            res.send({login: true, username: document.username});
        } else {
            res.send({login: false, username: ''});
        }
    }).catch(err => {
        res.status(404).send('Error');
    });
});

//create new user
router.post('/', function(req, res, next) {
    const info = {
        ...req.body,
        stocks: [],
        goals: []
    };
    const newUser = new user(info);
    newUser.save().then(() => {
        res.send('Success');
    }).catch(err => {
        res.status(404).send('Error');
    });
});

module.exports = router;