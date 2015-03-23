var api = require('../libs/userApi');
exports.get = function(req, res, next){
    api('get', 'club', {}, function(err,result){
        if (err){
            console.log(err, 'clubs');
        }else{
            res.render('clubs', {
                items: result
            });
        }
    });
};