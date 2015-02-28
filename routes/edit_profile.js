var async = require('async');
var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    api('get', 'user', {where: {id: id}}, function(err,result){
        if (err){
            console.log(err, 'admin_events');
        }else{
            console.log(result);
            res.render('edit_profile', {
                items: result
            });
        }
    });
};