var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

//login
router.post('/login', async function(req, res, next) {
    try {
        const user = await User.findOne({email: req.body.email});
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (passwordMatch) {
            const new_token = jwt.sign({'id': user._id}, process.env.application_key_1, { expiresIn: 3600 });
            res.status(200).send({
                firstName: user.firstName, 
                lastName: user.lastName,
                email: user.email,
                login: true, 
                token: new_token, 
                newToken: true,
                requestStatus: true});
        } else {
            res.send({login: false, token: '', requestStatus: true});
        }
    } catch {
        res.send({requestStatus: false});
    }
});

//create new user
router.post('/new', async function(req, res, next) {
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

router.post("/verify-token", async function(req, res, next) {
    try {
        const tokenInfo = jwt.verify(req.body.token, 'stockplanbackend');
        const user = await User.findOne({_id: tokenInfo.id});
        res.send({
            firstName: user.firstName, 
            lastName: user.lastName,
            email: user.email,
            login: true,
            token: req.body.token,
            tokenStatus: true,
            newToken: false,
            requestStatus: true});
    } catch {
        res.status(404).send({requestStatus: false, tokenStatus: false});
    }
});

module.exports = router;