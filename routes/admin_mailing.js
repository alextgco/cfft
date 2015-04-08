var async = require('async');
var api = require('../libs/api');
exports.get = function(req, res, next){
    var getActions = function(callback){
        api('get', 'action', {}, function(err,result){
            if (err){
                console.log(err, 'admin_event');
                return callback(err);
            }
            callback(null,result);
        });
    };

    var getArticles = function(callback){
        api('get', 'article', {}, function(err,result){
            if (err){
                console.log(err, 'admin_event');
                return callback(err);
            }
            callback(null,result);
        });
    };

    async.series([
        getActions,
        getArticles
    ],function(err,results){
        if (err){
            return next(err);
        }
        res.render('admin_mailing', {
            data: {
                actions: results[0],
                articles: results[1]
            }
        });
    });
};