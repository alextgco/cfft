var async = require('async');
var api = require('../libs/userApi');
exports.get = function(req, res, next){
    api('get', 'user', {where: {id: req.user.id}}, function(err,result){
        if (err){
            console.log(err, 'profile');
        }else{
            console.log(result);
            if(result.data.length == 0){
                res.render('page_404');
            }else{
                res.render('profile', {
                    items: result
                });
            }
        }
    });
};