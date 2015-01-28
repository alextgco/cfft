var express = require('express');
var router = express.Router();

/* GET users listing. */
var User = require('../models/user').User;
router.get('/', function(req, res, next) {
  User.find({},function(err,users){
    if (err) return next(err);
    res.json(users);
  })
});
router.get('/1', function(req, res, next) {
  res.end('sad');
});
module.exports = router;
