var User = require('../models/user').User;
var sendMail = require('../libs/sendMail');

exports.get = function(req, res, next){
    var email = req.query.email;
    var p = req.query.p;
    User.find({email:email,mailKey:p},function(err, user){
        if (err){
            console.log(err);
            return next(err);
        }
        User.confirmEmail(email,p,function(err,user){
            if (err) {
                console.log(err);
                return next(err);
            }
            var o = {
                email: email,
                subject: 'Успешная регистрация',
                html: 'Вы успешно зарегистрировались'
            };
            sendMail(o, function (err) {
                console.log(err);
                // Не будем здесь обрабатывать ош.
                next();
                //res.send(200);

            });
        });
    });
};
/*

exports.post = function(req, res, next){
    var login = req.body.login;
    var password = req.body.password;
    User.authorize(login, password, function(err, user){
        if (err){
            if (err instanceof AuthError){
                return res.json(403, err);
            }else{
                return next(err);
            }
        }
        req.session.user = user._id;
        res.send(200);
        //res.redirect('/');
    });


};*/
