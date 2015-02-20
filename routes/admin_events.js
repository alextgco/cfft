var api = require('../libs/api');
exports.get = function(req, res, next){
    var where = req.body.where || {id:'>0'};
    api('get', 'action', where, function(err,result){
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