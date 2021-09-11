var {User} = require('../db/mongoose.js');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');


const authentication = async function (req, res, next) {
    try {
        const token = req.header('authentication').replace('Bearer ', '');
        const tokenInfo = jwt.verify(token, 'stockplanbackend');
        const user = await User.findOne({_id: tokenInfo.id});
        req.user = user;
        next();
    } catch(e) {
        res.status(401).send('Token not found')
    }
}

module.exports = authentication;