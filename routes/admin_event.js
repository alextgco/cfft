var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    api('get', 'action_rewards', {where: {action_id: id}},function(err,result){
        if (err){
            console.log(err, 'action_rewards');
        }else{
            console.log('action_rewards',result);
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

        }

    });

};