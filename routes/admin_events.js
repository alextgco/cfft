var api = require('../libs/api');
exports.get = function(req, res, next){
    api('get', 'action', {}, function(err,result){
        if (err){
            console.log(err, 'admin_events');
        }else{
            console.log(result);
            res.render('admin_events', {
                items: result
            });
        }

    });
};