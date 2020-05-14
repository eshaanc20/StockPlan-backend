var express = require('express');
var router = express.Router();
var {user} = require('../db/mongoose.js');

//authentication for login
router.post('/login', function(req, res, next) {
    user.findOne({email: req.body.email}).then(document => {
        if (document.password == req.body.password) {
            res.send(true);
        } else {
            res.send(false);
        }
    }).catch(err => {
        res.status(404).send('Error')
    })
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
        res.send('Successful');
    }).catch(err => {
        res.status(404).send('Error')
    })
});

module.exports = router;