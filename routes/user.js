var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//login
router.post('/login', function(req, res, next) {
    try {
        const user = await User.findOne({email: req.body.email});
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
            const newToken = jwt.sign({'id': user._id}, 'stockplanbackend');
            res.send({...user, login: true, token: newToken, requestStatus: true});
        } else {
            res.send({login: false, token: '', requestStatus: true});
        }
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

//create new user
router.post('/new', function(req, res, next) {
    const info = {
        ...req.body,
    };
    try {
        const newUser = new User(info);
        newUser.password = await bcrypt.hash(req.body.password, 5);
        await newUser.save()
        res.send({requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;