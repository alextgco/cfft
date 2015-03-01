var async = require('async');
var api = require('../libs/userApi');
var HttpError = require('../error').HttpError;
exports.get = function(req, res, next){
    var id = req.query.id;
    api('get', 'user', {where: {id: id}}, function(err,result){
        if (err){
            console.log(err, 'admin_events');
        }else{
            console.log(result);
            if(result.data.length == 0){
                next(new HttpError(404,'Пользователь не найден.'));
            }else {
                res.render('edit_profile', {
                    items: result
                });
            }
        }
    });
};