var api = require('../libs/api');
exports.get = function(req, res, next){
    api('get', 'club', {limit: 20}, function(err,result){
        if (err){
            console.log(err, 'admin_clubs');
        }else{
            console.log(result);
            res.render('admin_clubs', {
                items: result
            });
        }
    });
};