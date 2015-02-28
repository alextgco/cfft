//var User = require('../models/user').User;

var HttpError = require('../error').HttpError;
var AuthError = require('../error').AuthError;

var api = require('../libs/userApi');

exports.get = function(req, res, next){
    res.render('login',{
        title:"Login"
    })
};

exports.post = function(req, res, next){
    var login = req.body.login;
    var password = req.body.password;

    api('authorize', 'user', {
        login:login,
        password:password
    }, function(err,user){
        if (err){
            if (err instanceof AuthError){
                return res.json(403, err);
            }else{
                return next(err);
            }
        }
        req.session.user = user.id;
        res.send(200);
    });




};