var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.body.id;
    api('get', 'action', JSON.stringify({id: id}),function(err,result){
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