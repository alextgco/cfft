var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    if(id == 'new'){
        res.render('admin_event_type', {
            data: {
                data: [],
                isNew: true
            }
        });
    }else{
        api('get', 'action_type', {where: {id: id}},function(err,result){
            if (err){
                console.log(err, 'action_types');
                return callback(err);
            }

            res.render('admin_event_type', {
                data: result,
                isNew: false
            });
        });
    }
};