var async = require('async');
var api = require('../libs/userApi');
exports.get = function(req, res, next){
    var id = req.query.id;
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
            var mths = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
            for(var i in result.data){
                var a = result.data[i];
                var s_date = a['date_start'];
                var y = s_date.substr(0,4);
                var m = s_date.substr(5,2);
                var d = s_date.substr(8,2);
                var textDate = (s_date.length > 0 && s_date != 'null')? d +' '+ mths[parseInt(m)-1] + ' ' + y : '';
                result.data[i]['date_start_text'] = textDate;
            }

            callback(null,result);
        });
    };
    var getActionParts = function(callback){
        api('get', 'action_part', {where: {action_id: id}, sort: {direction: 'ASC'}},function(err,result){
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
        res.render('event', {
            data: {
                rewards: results[0],
                actions: results[1],
                parts: results[2]
            }
        });
    });
};