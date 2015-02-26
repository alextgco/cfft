var api = require('../libs/api');
exports.get = function(req, res, next){
    api('get', 'results', {limit: 20, sort: 'position'}, function(err,result){
        if (err){
            console.log(err, 'admin_results');
        }else{
            console.log(result);
            res.render('admin_results', {
                items: result
            });
        }

    });
};