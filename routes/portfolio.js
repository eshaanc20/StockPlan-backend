var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var {Goal} = require('../db/mongoose.js');
var {Portfolio} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');
var axios = require('axios');

router.post('/add', authentication, async function(req, res, next) {
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