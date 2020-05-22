var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');

//login
router.post('/login', function(req, res, next) {
    try {
        const user = await User.findOne({email: req.body.email});
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
            const newToken = jwt.sign({'id': user._id}, 'stockplanbackend');
            res.send({...user, login: true, token: newToken});
        } else {
            res.send({login: false, token: ''});
        }
    } catch {
        res.status(404).send('Error');
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
        res.send('Success');
    } catch {
        res.status(404).send('Error');
    }
});

module.exports = router;