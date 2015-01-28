var User = require('../models/user').User;
var HttpError = require('../error').HttpError;
var AuthError = require('../error').AuthError;
var jade = require('jade');
var Guid = require('guid');
var sendMail = require('../libs/sendMail');
exports.get = function(req, res, next){
    res.render('registration',{
        title:"Регистрация"
    })
};
exports.post = function(req, res, next){
    // Обрабатываем запрос
    if (!req.body.password){
        return res.json(403, {message:'Не указан пароль'});
    }
    var guid = Guid.create();
    var obj = {
        firstname:req.body.name,
        surname:req.body.surname,
        secondname:req.body.secondname,
        gender:req.body.gender,
        email:req.body.email,
        country:req.body.country,
        city:req.body.city,
        club:req.body.club,
        isAgree:req.body.isAgree,
        password:req.body.password,
        mailKey:guid
    };

    User.registration(obj,function(err, user){
        if (err){
            if (err instanceof AuthError){
                return res.json(403, err);
            }else{
                return next(err);
            }
        }
        // Здесь отправка на почту

        var lnk = 'http://localhost:3000/reqConfirm?email='+obj.email+'&p='+guid;
        //var html = jade.renderFile('../views/', {lnk:'asd'});
        var html = ' <p>Вы упешно зарегистрировались на портале cfft.ru, посвященном CrossFit!<br/>' +
            'Перейдите по <a href="'+lnk+
            '">этой ссылке</a>, что бы подтвердить регистрацию.</p>' +
            '<p><br/>С уважением, Карягин Илья.</p>';
        var o = {
            email:obj.email,
            subject:'Подтверждение регистрации',
            html:html
        };
        sendMail(o,function(err){
            if (err){
                console.log(err);
                return res.json(403, err);
            }
            res.json(200, {toastr:{type:'success',message:"На почту, указанную при регистрации отправлено письмо со ссылкой на подтверждение регистрации"}});
        });
        //res.redirect('/');

    });
    //res.send(403);
};