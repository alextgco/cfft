var user = require('../models/user');
var HttpError = require('../error').HttpError;
var AuthError = require('../error').AuthError;
var jade = require('jade');
var Guid = require('guid');
var sendConfirm = require('../modules/regMailer').sendConfirm;

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
    var guid = Guid.create().value;
    var obj = {
        firstname:req.body.name,
        surname:req.body.surname,
        secondname:req.body.secondname,
        /*gender_id:req.body.gender,*/
        email:req.body.email,
      /*  country:req.body.country,
        city:req.body.city,
        club:req.body.club,*/
        isAgree:(req.body.isAgree)?1:0,
        password:req.body.password,
        mailKey:guid
    };
    user.registration(obj,function(err, user_id){
        if (err){
            console.log(err);
            if (err instanceof AuthError){

                return res.json(403, err);
            }else{
                return next(err);
            }
        }
        // Здесь отправка на почту
        var host = req.protocol +'://'+ req.host;
        if (req.host=='localhost'){
            host += ':3000';
        }
        sendConfirm({
            host:host,
            email:obj.email,
            guid:guid
        }, function(err){
            if (err){
                user.remove(user_id,function(err){
                    if (err){
                        return res.json(403, err);
                    }
                    return res.json(403, {message:"Не удалось завершить регистрацию"});
                });
            }else{
                return res.json(200, {toastr:{type:'success',message:"На почту, указанную при регистрации отправлено письмо со ссылкой на подтверждение регистрации"}});
            }
        });

    });

    /*User.registration(obj,function(err, user){
        if (err){
            if (err instanceof AuthError){
                return res.json(403, err);
            }else{
                return next(err);
            }
        }
        // Здесь отправка на почту
        var host = req.protocol +'://'+ req.host;
        if (req.host=='localhost'){
            host += ':3000';
        }
        sendConfirm({
            host:host,
            email:obj.email,
            guid:guid
        }, function(err){
            if (err){
                User.remove(user.id,function(err){
                    if (err){
                        return res.json(403, err);
                    }
                    return res.json(403, {message:"Не удалось завершить регистрацию"});
                });
            }else{
                return res.json(200, {toastr:{type:'success',message:"На почту, указанную при регистрации отправлено письмо со ссылкой на подтверждение регистрации"}});
            }
        });

    });*/
};