var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    console.log(id);
    api('get', 'action', {where: {id: id}},function(err,result){
        if (err){
            console.log(err, 'admin_event');
        }else{
            console.log(result);
            res.render('admin_event', {
                data: result
            });
        }

    });
};