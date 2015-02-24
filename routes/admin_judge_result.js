var api = require('../libs/api');
exports.get = function(req, res, next){
    var id = req.query.id;
    api('get', 'results', {where: {id: id}}, function(err,result){
        if (err){
            console.log(err, 'admin_judge_result');
        }else{
            console.log(result);
            res.render('admin_judge_result', {
                items: result
            });
        }

    });
};