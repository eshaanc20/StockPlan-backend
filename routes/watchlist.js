var express = require('express');
var router = express.Router();
var {User} = require('../db/mongoose.js');
var {Goal} = require('../db/mongoose.js');
var {Watchlist} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var authentication = require('../middleware/authentication.js');
var axios = require('axios');

//get all user watchlists
router.get('/user', authentication, async function(req, res, next) {
    try {
        const watchlists = await Watchlist.find({userId: req.user._id});
        let responses = [];
        watchlists.forEach((watchlist, index1) => {
            response.push({...watchlist});
            response[index1].responseData = [];
            watchlist.stocks.forEach((stock) => {
                try {
                    const response = await axios.get('https://finnhub.io/api/v1/quote?symbol=' + stock + '&token=br1ie2frh5reisn53n3g');
                    const info = {
                        symbol: stock,
                        ...response.data,
                    }
                    responses[index1].responseData.push(response.data);
                } catch (error) {
                    console.log(error);
                }
            })
        });
        res.send({watchlists: responses});
    } catch {
        res.status(404).send({requestStatus: false});
    }
});

module.exports = router;