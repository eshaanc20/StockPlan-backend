var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'StockPlan Backend REST API' });
});

module.exports = router;
