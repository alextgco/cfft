var api = require('../libs/api');
exports.get = function(req, res, next){
    api('get', 'action_types', {}, function(err,result){
        if (err){
            console.log(err, 'action_types');
        }else{
            console.log(result);
            res.render('admin_event_types', {
                items: result
            });
        }
    });
};