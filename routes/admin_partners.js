var api = require('../libs/api');
exports.get = function(req, res, next){
    api('get', 'partner', {limit: 20}, function(err,result){
        if (err){
            console.log(err, 'admin_partners');
        }else{
            console.log(result);
            res.render('admin_partners', {
                items: result
            });
        }
    });
};