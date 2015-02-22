var async = require('async');
var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    if(id == 'new'){
        res.render('admin_event', {
            data: {
                rewards: {data:[]},
                actions: {data:[]},
                parts: {data:[]},
                isNew: true
            }
        });
    }else{
        var loadActionRewards = function(callback){
            api('get', 'action_rewards', {where: {action_id: id}},function(err,result){
                if (err){
                    console.log(err, 'action_rewards');
                    return callback(err);
                }
                callback(null,result);
            });
        };
        var getAction = function(callback){
            api('get', 'action', {where: {id: id}},function(err,result){
                if (err){
                    console.log(err, 'admin_event');
                    return callback(err);
                }
                callback(null,result);
            });
        };
        var getActionParts = function(callback){
            api('get', 'action_part', {where: {action_id: id}},function(err,result){
                if (err){
                    console.log(err, 'admin_event');
                    return callback(err);
                }
                console.log('PARTS', result);
                if(result.data.length == 0){

                }
                callback(null,result);
            });
        };

        async.series([
            loadActionRewards,
            getAction,
            getActionParts
        ],function(err,results){
            if (err){
                return next(err);
            }
            res.render('admin_event', {
                data: {
                    rewards: results[0],
                    actions: results[1],
                    parts: results[2],
                    isNew: false
                }
            });
        });
    }
};